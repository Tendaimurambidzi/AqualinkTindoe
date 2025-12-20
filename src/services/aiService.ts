// AI Service using Firebase Functions with Vertex AI

import functions from '@react-native-firebase/functions';

export async function generateText(prompt: string): Promise<string> {
  try {
    console.log('Calling Firebase function with prompt:', prompt.substring(0, 50) + '...');
    const result = await functions().httpsCallable('generateAIResponse')({ prompt });
    console.log('Firebase function response received');
    return result.data.response;
  } catch (error: any) {
    console.error('AI generation error:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);

    // Provide more specific error messages
    if (error.code === 'functions/unauthenticated') {
      return 'AI unavailable - please sign in to use this feature';
    } else if (error.code === 'functions/internal') {
      return 'AI service temporarily unavailable - please try again later';
    } else if (error.code === 'functions/cancelled') {
      return 'AI request was cancelled - please try again';
    } else {
      return `AI unavailable: ${error.message || 'Unknown error'}`;
    }
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

export async function generateSchoolFeedback(feature: string): Promise<string> {
  const prompt = `Generate educational feedback and tips for the "${feature}" feature in a school/learning mode of a social app. Make it encouraging and informative.`;
  return await generateText(prompt);
}

export async function generateExploreContent(title: string, desc: string): Promise<string> {
  const prompt = `Generate engaging content for the "${title}" exploration feature described as: "${desc}". Create an exciting preview or sample content that would make users want to explore this feature.`;
  return await generateText(prompt);
}