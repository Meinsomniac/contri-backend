import path from "path";
import ejs from "ejs";

interface TemplateMapper {
  templateName: string;
  data: Record<any, any>;
}

export default async function templateMapper({
  templateName,
  data,
}: TemplateMapper) {
  const templatePath = path.join(__dirname, "templates", `${templateName}.ejs`);
  const html = await ejs.renderFile(templatePath, data);
  return html;
}
