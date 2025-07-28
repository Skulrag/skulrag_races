import { useTranslation } from "react-i18next";

export default function HelpScreen() {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full overflow-auto text-[#c9c9c9] bg-black py-8 px-8 font-mono text-sm whitespace-pre-line">
      {t("helpScreen.instructions")}
      <pre className="text-green-400 border border-green-400 px-3 py-2 my-4 overflow-auto whitespace-pre-wrap font-mono">
        <code>/sk_addcheckpoint &lt;track ID&gt; : <span className="text-[#ffe38d]">{t("helpScreen.addCheckpointInfo")}</span></code>
      </pre>
      {t("helpScreen.instructions2")}
    </div>
  );
}
