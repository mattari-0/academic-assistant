import os, re

android_dir = "mobile/android"

# 1. Update root build.gradle to enforce compileSdkVersion 34 on all subprojects
root_build = os.path.join(android_dir, "build.gradle")
if os.path.exists(root_build):
    with open(root_build, "r", encoding="utf-8") as f:
        content = f.read()
    subproject_config = """
subprojects {
    afterEvaluate { project ->
        if (project.hasProperty('android')) {
            project.android {
                compileSdkVersion 34
            }
        }
    }
}
"""
    if "afterEvaluate" not in content:
        content += "\n" + subproject_config
    with open(root_build, "w", encoding="utf-8") as f:
        f.write(content)
    print("Configured root build.gradle with subprojects compileSdkVersion")

# 2. Patch settings.gradle
settings_path = os.path.join(android_dir, "settings.gradle")
if os.path.exists(settings_path):
    with open(settings_path, "r", encoding="utf-8") as f:
        content = f.read()
    if "com.google.gms.google-services" not in content:
        content = re.sub(
            r'(id\s+"dev\.flutter\.flutter-plugin-loader"[^\n]*)',
            r'\1\n    id "com.google.gms.google-services" version "4.4.2" apply false',
            content
        )
        with open(settings_path, "w", encoding="utf-8") as f:
            f.write(content)
    print("Configured settings.gradle")

# 3. Patch app/build.gradle
app_build = os.path.join(android_dir, "app", "build.gradle")
if os.path.exists(app_build):
    with open(app_build, "r", encoding="utf-8") as f:
        content = f.read()
    if "com.google.gms.google-services" not in content:
        content = content.replace(
            'id "dev.flutter.flutter-gradle-plugin"',
            'id "dev.flutter.flutter-gradle-plugin"\n    id "com.google.gms.google-services"'
        )
    content = re.sub(r'minSdkVersion\s+flutter\.minSdkVersion', 'minSdkVersion 23', content)
    content = re.sub(r'compileSdkVersion\s+flutter\.compileSdkVersion', 'compileSdkVersion 34', content)
    if "multiDexEnabled" not in content:
        content = re.sub(
            r'(applicationId\s+["\'][^"\']+["\'])',
            r'\1\n        multiDexEnabled true',
            content
        )
    with open(app_build, "w", encoding="utf-8") as f:
        f.write(content)
    print("Configured app/build.gradle")
