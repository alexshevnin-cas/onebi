// Per-app seed config for the embedded CAS mediation editor. Every app in Apps
// Management reuses the bundled DriveX sample (our current real config) as test
// data, with bundle/platform/appName overridden from the selected app.
import sampleApp from "./sampleApp.json";

export function seedAppConfig({ bundle, platform, appName }) {
  const base = structuredClone(sampleApp);
  return {
    ...base,
    bundle,
    platform: platform === "ios" ? "ios" : "android",
    appName: appName || base.appName,
  };
}
