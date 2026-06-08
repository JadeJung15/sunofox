# SF Midjourney / Grok Bridge

Chrome extension for SF Studio.

## What It Does

- Sends SF Studio prompts to Midjourney.
- Supports Midjourney input-only, current generate, next prompt, 5-cut auto, and 10-cut auto flows.
- Sends selected SF Studio images and video prompts to the SF Grok Bridge panel for manual image-to-video work.
- Grok manual mode shows one cut at a time, sends it when `현재 컷 보내기` is clicked, and records submitted/failed/skipped status.
- Bridge panels can be hidden and restored with the panel toggle button.

## Install

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click `Load unpacked`.
4. Select this folder:
   `C:\Users\jadej\OneDrive\문서\SunoFox PJ\SunoFox\extensions\midjourney-bridge`

If you install from ZIP, unzip `sf-midjourney-bridge-v1.5.17.zip` first and load the unzipped folder.

## Notes

- The extension does not store account credentials.
- Grok manual sending uses Chrome's debugger permission only for legacy auto mode and explicit send fallback.
- Midjourney auto-submit is opt-in from SF Studio or the bridge panel.
- Grok auto mode remains legacy-only. The default workflow is manual: review the current cut in the panel, click `현재 컷 보내기`, then continue with the next pending cut shown automatically.
- If Midjourney or Grok changes its UI, SF Studio still copies the prompt as fallback.
