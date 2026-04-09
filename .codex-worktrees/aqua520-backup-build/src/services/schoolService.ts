import { Alert } from 'react-native';

/**
 * Register organization for Notice Board
 */
export async function registerNoticeBoard(data: {
  orgName: string;
  orgType: string;
  email: string;
  phone: string;
  bio: string;
  uid?: string;
}): Promise<{ ok: boolean; registrationId?: string; message?: string }> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Configuration Error', 'Backend URL not configured');
      return { ok: false, message: 'Backend not configured' };
    }

    const response = await fetch(`${backendBase}/notice-board/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      Alert.alert(
        'Registration Received!',
        result.message || 'Your registration has been submitted. Proceed to payment to activate your account.',
        [{ text: 'OK' }]
      );
      return { ok: true, registrationId: result.registrationId, message: result.message };
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
      return { ok: false, message: result.error };
    }
  } catch (error) {
    console.error('Notice Board registration error:', error);
    Alert.alert('Error', 'Could not submit registration. Please check your connection.');
    return { ok: false, message: 'Network error' };
  }
}

/**
 * Register a school (Zimbabwe schools)
 */
export async function registerSchool(data: {
  schoolName: string;
  email: string;
  phone: string;
  address: string;
  principalName: string;
  uid?: string;
}): Promise<{ ok: boolean; schoolId?: string; message?: string }> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Configuration Error', 'Backend URL not configured');
      return { ok: false, message: 'Backend not configured' };
    }

    const response = await fetch(`${backendBase}/school/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      Alert.alert(
        'School Registered!',
        result.message || 'Your school has been successfully registered.',
        [{ text: 'OK' }]
      );
      return { ok: true, schoolId: result.schoolId, message: result.message };
    } else {
      Alert.alert(
        'Registration Issue',
        result.error || 'Please ensure your school is in our Zimbabwe schools list',
        result.suggestion ? [
          { text: 'OK' },
          { text: 'Contact Support', onPress: () => Alert.alert('Support', result.suggestion) }
        ] : [{ text: 'OK' }]
      );
      return { ok: false, message: result.error };
    }
  } catch (error) {
    console.error('School registration error:', error);
    Alert.alert('Error', 'Could not submit registration. Please check your connection.');
    return { ok: false, message: 'Network error' };
  }
}

/**
 * Get list of registered Zimbabwe schools
 */
export async function getZimbabweSchools(): Promise<string[]> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      return [];
    }

    const response = await fetch(`${backendBase}/school/list-zimbabwe`);
    const result = await response.json();

    if (response.ok && result.schools) {
      return result.schools;
    }
    
    return [];
  } catch (error) {
    console.error('Get Zimbabwe schools error:', error);
    return [];
  }
}

/**
 * Register a teacher
 */
export async function registerTeacher(data: {
  schoolId: string;
  name: string;
  email: string;
  subject: string;
  teacherId?: string;
  uid?: string;
}): Promise<{ ok: boolean; teacherId?: string; message?: string }> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Configuration Error', 'Backend URL not configured');
      return { ok: false, message: 'Backend not configured' };
    }

    const response = await fetch(`${backendBase}/teacher/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      Alert.alert(
        'Teacher Registered!',
        result.message || 'Teacher account created successfully.',
        [{ text: 'OK' }]
      );
      return { ok: true, teacherId: result.teacherId, message: result.message };
    } else {
      Alert.alert('Registration Failed', result.error || 'Please try again');
      return { ok: false, message: result.error };
    }
  } catch (error) {
    console.error('Teacher registration error:', error);
    Alert.alert('Error', 'Could not submit registration. Please check your connection.');
    return { ok: false, message: 'Network error' };
  }
}

/**
 * Create a lesson (Teacher's Dock)
 */
export async function createLesson(data: {
  teacherId: string;
  title: string;
  subject: string;
  description: string;
  scheduledTime?: string;
}): Promise<{ ok: boolean; lessonId?: string; message?: string }> {
  try {
    const cfg = require('../liveConfig');
    const backendBase = cfg?.BACKEND_BASE_URL || '';
    
    if (!backendBase) {
      Alert.alert('Configuration Error', 'Backend URL not configured');
      return { ok: false, message: 'Backend not configured' };
    }

    const response = await fetch(`${backendBase}/teacher/create-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.ok && result.ok) {
      Alert.alert(
        'Lesson Created!',
        result.message || 'Your lesson has been scheduled successfully.',
        [{ text: 'OK' }]
      );
      return { ok: true, lessonId: result.lessonId, message: result.message };
    } else {
      Alert.alert('Creation Failed', result.error || 'Please try again');
      return { ok: false, message: result.error };
    }
  } catch (error) {
    console.error('Create lesson error:', error);
    Alert.alert('Error', 'Could not create lesson. Please check your connection.');
    return { ok: false, message: 'Network error' };
  }
}
