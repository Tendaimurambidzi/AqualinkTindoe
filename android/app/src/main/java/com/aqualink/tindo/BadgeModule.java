package com.aqualink.tindo;

import android.content.Context;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import me.leolin.shortcutbadger.ShortcutBadger;

public class BadgeModule extends ReactContextBaseJavaModule {
  BadgeModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "BadgeModule";
  }

  @ReactMethod
  public void setBadge(int count) {
    Context context = getReactApplicationContext();
    try {
      if (count <= 0) {
        ShortcutBadger.removeCount(context);
      } else {
        ShortcutBadger.applyCount(context, count);
      }
    } catch (Exception ignored) {
      // Some launchers do not support badges; ignore failures.
    }
  }

  @ReactMethod
  public void clearBadge() {
    Context context = getReactApplicationContext();
    try {
      ShortcutBadger.removeCount(context);
    } catch (Exception ignored) {
      // ignore
    }
  }
}
