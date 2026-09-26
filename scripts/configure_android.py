import os, re

android_dir = "mobile/android"

# Configure settings.gradle / settings.gradle.kts
for fname in ["settings.gradle", "settings.gradle.kts"]:
    path = os.path.join(android_dir, fname)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        is_kts = fname.endswith(".kts")
        if "com.google.gms.google-services" not in content:
            if is_kts:
                content = re.sub(
                    r'(id\("dev\.flutter\.flutter-plugin-loader"\)[^\n]*)',
                    r'\1\n    id("com.google.gms.google-services") version "4.4.2" apply false',
                    content
                )
            else:
                content = re.sub(
                    r'(id\s+"dev\.flutter\.flutter-plugin-loader"[^\n]*)',
                    r'\1\n    id "com.google.gms.google-services" version "4.4.2" apply false',
                    content
                )
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
        print(f"Configured {path}")

# Configure app/build.gradle / app/build.gradle.kts
for fname in ["build.gradle", "build.gradle.kts"]:
    path = os.path.join(android_dir, "app", fname)
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        is_kts = fname.endswith(".kts")
        if "com.google.gms.google-services" not in content:
            if is_kts:
                content = content.replace(
                    'id("dev.flutter.flutter-gradle-plugin")',
                    'id("dev.flutter.flutter-gradle-plugin")\n    id("com.google.gms.google-services")'
                )
            else:
                content = content.replace(
                    'id "dev.flutter.flutter-gradle-plugin"',
                    'id "dev.flutter.flutter-gradle-plugin"\n    id "com.google.gms.google-services"'
                )
        content = re.sub(r'minSdk(Version)?\s*=?\s*flutter\.minSdkVersion', r'minSdk = 23' if is_kts else r'minSdkVersion 23', content)
        if "multiDexEnabled" not in content:
            content = re.sub(
                r'(applicationId\s*=?\s*["\'][^"\']+["\'])',
                r'\1\n        multiDexEnabled = true' if is_kts else r'\1\n        multiDexEnabled true',
                content
            )
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Configured {path}")
