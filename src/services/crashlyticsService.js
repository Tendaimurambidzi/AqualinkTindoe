let cachedInstance = undefined;

const getCrashlytics = () => {
  if (typeof cachedInstance !== 'undefined') {
    return cachedInstance;
  }
  try {
    const mod = require('@react-native-firebase/crashlytics').default;
    cachedInstance = typeof mod === 'function' ? mod() : null;
  } catch (error) {
    cachedInstance = null;
  }
  return cachedInstance;
};

const normalizeError = error =>
  error instanceof Error ? error : new Error(String(error || 'Unknown error'));

export const isCrashlyticsAvailable = () => !!getCrashlytics();

export const logCrashMessage = message => {
  try {
    const instance = getCrashlytics();
    if (!instance || !message) return;
    instance.log(String(message));
  } catch {}
};

export const recordCrashError = (error, context = null) => {
  try {
    const instance = getCrashlytics();
    if (!instance) return;
    if (context) {
      instance.log(
        typeof context === 'string' ? context : JSON.stringify(context),
      );
    }
    instance.recordError(normalizeError(error));
  } catch {}
};

export const setCrashUser = userId => {
  try {
    const instance = getCrashlytics();
    if (!instance) return;
    instance.setUserId(String(userId || 'anonymous'));
  } catch {}
};

export const setCrashAttributes = attributes => {
  try {
    const instance = getCrashlytics();
    if (!instance || !attributes || typeof attributes !== 'object') return;
    const next = {};
    Object.entries(attributes).forEach(([key, value]) => {
      if (!key) return;
      next[String(key)] = String(value ?? '');
    });
    instance.setAttributes(next);
  } catch {}
};
