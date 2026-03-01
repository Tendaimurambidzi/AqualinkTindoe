// AI Service using Firebase Functions with Vertex AI

import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';
import { XAI_API_KEY, XAI_MODEL } from '../../liveConfig';

async function generateTextViaXAI(prompt: string): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: XAI_MODEL || 'grok-2-latest',
      messages: [
        {
          role: 'system',
          content:
            'You are a concise assistant for a social app. Keep responses useful and safe.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`xAI request failed (${response.status}): ${text}`);
  }

  const payload: any = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('xAI returned an empty response');
  }
  return content.trim();
}

export async function generateText(prompt: string): Promise<string> {
  try {
    // Prefer direct xAI call when key is configured.
    if (XAI_API_KEY) {
      try {
        return await generateTextViaXAI(prompt);
      } catch (xaiError) {
        console.warn('xAI direct call failed, falling back to Firebase callable:', xaiError);
      }
    }

    // Firebase callable fallback requires auth.
    const currentUser = auth().currentUser;
    if (!currentUser) {
      return 'Please sign in to use AI features';
    }

    // Fallback to us-central1 callable function.
    const result = await functions('us-central1').httpsCallable('generateAIResponse')({ prompt });
    return result?.data?.response || 'AI unavailable - please try again later';
  } catch (error: any) {
    console.error('AI generation error:', error);
    if (error.message?.includes('unauthenticated')) {
      return 'Please sign in to use AI features';
    }
    return 'AI unavailable - please try again later';
  }
}

export async function analyzeVibe(text: string): Promise<string> {
  const prompt = `Analyze the vibe of this text and suggest improvements: ${text}`;
  return await generateText(prompt);
}

export async function generateVibeSuggestion(): Promise<string> {
  const prompt = 'Generate a creative and positive vibe message for a social app.';
  return await generateText(prompt);
}

export type MediaCaptionContext = {
  mediaKind: 'image' | 'video';
  mimeType?: string;
  fileName?: string;
  width?: number;
  height?: number;
  durationSec?: number;
  hasAudioOverlay?: boolean;
  editsSummary?: string;
  sceneHints?: string[];
  localPreviewObserved?: boolean;
  mediaUrl?: string;
  previewImageUrl?: string;
  currentCaption?: string;
};

const summarizeVisionFromImage = async (
  imageUrl?: string,
): Promise<string | null> => {
  if (!XAI_API_KEY || !imageUrl) return null;
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: XAI_MODEL || 'grok-3-mini',
        messages: [
          {
            role: 'system',
            content:
              'Describe visible scene content in one short sentence. Focus on concrete subject/action.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'What is happening in this media?' },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: 0.2,
      }),
    });
    if (!response.ok) return null;
    const payload: any = await response.json();
    const content = payload?.choices?.[0]?.message?.content;
    return typeof content === 'string' ? content.trim() : null;
  } catch {
    return null;
  }
};

export async function generateMediaCaptionSuggestion(
  context: MediaCaptionContext,
): Promise<string> {
  const {
    mediaKind,
    mimeType,
    fileName,
    width,
    height,
    durationSec,
    hasAudioOverlay,
    editsSummary,
    sceneHints,
    localPreviewObserved,
    mediaUrl,
    previewImageUrl,
    currentCaption,
  } = context;

  const sizeHint =
    width && height ? `${width}x${height}` : 'unknown dimensions';
  const durationHint =
    mediaKind === 'video' && durationSec
      ? `${Math.max(1, Math.round(durationSec))}s`
      : 'n/a';
  const audioHint =
    mediaKind === 'video'
      ? hasAudioOverlay
        ? 'with overlay audio'
        : 'no overlay audio'
      : hasAudioOverlay
      ? 'with attached audio'
      : 'no attached audio';
  const hintText =
    sceneHints && sceneHints.length > 0
      ? sceneHints.join(', ')
      : 'none';
  const visionHint = await summarizeVisionFromImage(
    previewImageUrl || (mediaKind === 'image' ? mediaUrl : undefined),
  );

  const prompt =
    `Generate exactly one custom social caption for this ${mediaKind} post.\n` +
    `Media details: kind=${mediaKind}, mime=${mimeType || 'unknown'}, fileName=${fileName || 'unknown'}, size=${sizeHint}, duration=${durationHint}, audio=${audioHint}.\n` +
    `Local scene hints from filename/path/caption: ${hintText}.\n` +
    `Visual scene summary: ${visionHint || 'not available'}.\n` +
    `Local preview observed before posting: ${localPreviewObserved ? 'yes' : 'no'}.\n` +
    `Edits applied: ${editsSummary || 'none'}.\n` +
    `Existing draft caption: "${(currentCaption || '').trim() || 'none'}".\n` +
    'Rules: return only the caption text, no quotes, no numbering, no hashtags spam, maximum 140 characters. Be concrete and content-specific (for example dancing, flood water, football), never generic placeholders like "nice visual".';

  return await generateText(prompt);
}

export async function generateSearchSuggestion(): Promise<string> {
  const prompt = 'Suggest a creative username or keyword for searching users in a social app.';
  return await generateText(prompt);
}

export async function generateEchoSuggestion(postContext?: {
  captionText?: string;
  mediaType?: string;
  authorName?: string;
  hasImage?: boolean;
  hasVideo?: boolean;
  mediaUrl?: string;
  previewImageUrl?: string;
  fileName?: string;
  sceneHints?: string[];
}): Promise<string> {
  let prompt = 'Generate a thoughtful and positive echo (comment) for a social media post.';

  if (postContext) {
    const {
      captionText,
      authorName,
      hasImage,
      hasVideo,
      mediaUrl,
      previewImageUrl,
      fileName,
      sceneHints,
    } = postContext;

    // Build context-aware prompt
    let contextInfo = '';
    if (captionText && captionText.trim()) {
      contextInfo += `The post text is: "${captionText}". `;
    }
    if (hasImage) {
      contextInfo += 'The post includes an image. ';
    }
    if (hasVideo) {
      contextInfo += 'The post includes a video. ';
    }
    if (fileName) {
      contextInfo += `Media file name hint: "${fileName}". `;
    }
    if (sceneHints && sceneHints.length) {
      contextInfo += `Scene hints: ${sceneHints.join(', ')}. `;
    }
    if (authorName) {
      contextInfo += `Posted by ${authorName}. `;
    }
    const visionHint = await summarizeVisionFromImage(
      previewImageUrl || (hasImage ? mediaUrl : undefined),
    );
    if (visionHint) {
      contextInfo += `Visual summary: ${visionHint}. `;
    }

    if (contextInfo.trim()) {
      prompt = `Generate one thoughtful and positive echo (comment) for this social media post. ${contextInfo}Make the echo specific to what is happening in the media, not generic.`;
    }
  }

  return await generateText(prompt);
}

// School Mode AI Features
export async function generateSchoolFeedback(postContent: string, postType: string): Promise<string> {
  const prompt = `As an educational AI assistant, provide constructive feedback on this ${postType} post for a school/educational context. Focus on learning value, clarity, and engagement: "${postContent}". Provide specific, actionable suggestions for improvement.`;
  return await generateText(prompt);
}

export async function generateStudyTip(subject?: string): Promise<string> {
  const subjectPrompt = subject ? ` for ${subject}` : '';
  const prompt = `Generate a helpful study tip${subjectPrompt} that students can apply immediately. Make it practical and encouraging.`;
  return await generateText(prompt);
}

export async function generateQuizQuestion(topic: string): Promise<string> {
  const prompt = `Create an engaging quiz question about "${topic}" with 4 multiple choice options and indicate the correct answer. Format it clearly for educational purposes.`;
  return await generateText(prompt);
}

// Explore Mode AI Features
export async function generateExploreContent(theme: string, contentType: 'story' | 'fact' | 'activity' | 'question'): Promise<string> {
  const prompts = {
    story: `Create an engaging short story about "${theme}" that sparks curiosity and imagination.`,
    fact: `Share an interesting and lesser-known fact about "${theme}" that would fascinate and educate.`,
    activity: `Design a fun, hands-on activity related to "${theme}" that can be done at home or school.`,
    question: `Pose a thought-provoking question about "${theme}" that encourages deep thinking and discussion.`
  };

  const prompt = prompts[contentType] || `Generate engaging content about "${theme}" for exploration and learning.`;
  return await generateText(prompt);
}

export async function generateSearchBackedExploreResponse(input: {
  query: string;
  webFindings?: string[];
}): Promise<string> {
  const findings = (input.webFindings || []).filter(Boolean).slice(0, 8);
  const findingsText = findings.length ? findings.join('\n') : 'No external findings provided.';
  const prompt =
    `You are helping in Adventure Space (Explore Mode).\n` +
    `User query: "${input.query}".\n` +
    `Web findings:\n${findingsText}\n` +
    `Task: Provide a concise, practical response with:\n` +
    `1) A direct answer\n2) 3 quick facts\n3) 2 suggested next searches\n` +
    `Keep it accurate, non-generic, and easy to read.`;
  return await generateText(prompt);
}

export async function generateStudyHubResponse(input: {
  query: string;
  subheading?: string;
  webFindings?: string[];
}): Promise<string> {
  const findings = (input.webFindings || []).filter(Boolean).slice(0, 10);
  const findingsText = findings.length ? findings.join('\n') : 'No external findings provided.';
  const prompt =
    `You are a Study Hub AI tutor.\n` +
    `Study topic: "${input.query}".\n` +
    `Subheading: "${input.subheading || 'General'}".\n` +
    `Web findings:\n${findingsText}\n` +
    `Task: Give a learner-friendly answer with:\n` +
    `1) Simple explanation\n2) Key points\n3) Practice question\n4) Suggested references from findings\n` +
    `Be specific and educational.`;
  return await generateText(prompt);
}

export async function generateCuriosityQuestion(topic: string): Promise<string> {
  const prompt = `Generate a thought-provoking question about "${topic}" that would make someone curious and want to learn more. Make it engaging and open-ended.`;
  return await generateText(prompt);
}

export async function generateExplorationPath(startingPoint: string): Promise<string> {
  const prompt = `Create a learning exploration path starting from "${startingPoint}". Suggest 3-4 connected topics or questions that build upon each other to deepen understanding.`;
  return await generateText(prompt);
}

// Advanced AI Features
export async function generatePersonalizedAdvice(userContext: string, requestType: string): Promise<string> {
  const prompt = `Based on this user context: "${userContext}", provide personalized ${requestType} advice. Be helpful, encouraging, and specific.`;
  return await generateText(prompt);
}

export async function generateCreativePrompt(medium: string): Promise<string> {
  const prompt = `Generate a creative prompt for ${medium} that inspires artistic expression and imagination.`;
  return await generateText(prompt);
}

export async function analyzeAndSuggest(content: string, analysisType: 'improvement' | 'engagement' | 'educational' | 'creative'): Promise<string> {
  const analysisPrompts = {
    improvement: `Analyze this content and suggest specific improvements: "${content}"`,
    engagement: `How can this content be made more engaging for the target audience: "${content}"`,
    educational: `What educational value does this content have and how can it be enhanced: "${content}"`,
    creative: `Suggest creative ways to expand or reimagine this content: "${content}"`
  };

  const prompt = analysisPrompts[analysisType] || `Analyze this content: "${content}"`;
  return await generateText(prompt);
}

// GROK AI Media Creation and Editing Features
export async function generateImageWithGrok(prompt: string): Promise<string> {
  // Note: GROK can generate images via xAI API, but implementation requires image generation endpoint
  // For now, return a descriptive prompt that can be used with image generation tools
  const enhancedPrompt = `Create a detailed image generation prompt based on: "${prompt}". Include style, colors, composition, and mood.`;
  return await generateText(enhancedPrompt);
}

export async function editImageWithGrok(imageDescription: string, editRequest: string): Promise<string> {
  const prompt = `Given this image description: "${imageDescription}", suggest how to edit it for: "${editRequest}". Provide specific editing instructions, filters, or modifications.`;
  return await generateText(prompt);
}

export async function generateVideoScriptWithGrok(theme: string, duration: string = '30 seconds'): Promise<string> {
  const prompt = `Create a video script for a ${duration} video about "${theme}". Include scene descriptions, voiceover text, and visual suggestions. Structure it with timestamps.`;
  return await generateText(prompt);
}

export async function generateVideoConceptWithGrok(prompt: string): Promise<string> {
  const enhancedPrompt = `Develop a complete video concept based on: "${prompt}". Include theme, style, target audience, key scenes, music suggestions, and production notes.`;
  return await generateText(enhancedPrompt);
}
