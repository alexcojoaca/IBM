import Doc from "../Doc";
import { LEGAL } from "../content";

export default function TermsPage() {
  return <Doc title={LEGAL.en.termsTitle} blocks={LEGAL.en.terms} />;
}
