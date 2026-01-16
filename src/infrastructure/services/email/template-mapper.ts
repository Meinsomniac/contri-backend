import path from "path";
import ejs from "ejs";
import fs from "fs";

interface TemplateMapper {
  templateName: string;
  data: Record<any, any>;
}

export default async function templateMapper({
  templateName,
  data,
}: TemplateMapper) {
  const templatePath = path.join(__dirname, "templates", `${templateName}.ejs`);
  console.log({ templatePath, data });
  console.log(fs.existsSync(templatePath));
  const html = await ejs.renderFile(templatePath, data);
  return html;
}
