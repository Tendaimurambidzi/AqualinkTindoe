// AI Service using Firebase Functions with Vertex AI

import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';

export async function generateText(prompt: string): Promise<string> {
  try {
    // Ensure user is authenticated
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to use AI features');
    }

    // Use us-central1 region explicitly
    const result = await functions().httpsCallable('generateAIResponse', { region: 'us-central1' })({ prompt });
    return result.data.response;
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

export async function generateSearchSuggestion(): Promise<string> {
  const prompt = 'Suggest a creative username or keyword for searching users in a social app.';
  return await generateText(prompt);
}

export async function generateEchoSuggestion(): Promise<string> {
  const prompt = 'Generate a thoughtful and positive echo (comment) for a social media post.';
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