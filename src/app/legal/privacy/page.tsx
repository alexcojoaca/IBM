import Doc from "../Doc";
import { LEGAL } from "../content";

export default function PrivacyPage() {
  return <Doc title={LEGAL.en.privacyTitle} blocks={LEGAL.en.privacy} />;
}
