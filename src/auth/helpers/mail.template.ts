import { readFile } from 'fs/promises';
import * as Handlebars from 'handlebars';
import { join } from 'path';
import { Template } from '../enums/email.template';

export async function renderTemplate(
  templateName: Template,
  data: Record<string, unknown>,
): Promise<string> {
  const filePath = join(__dirname, '..', 'templates', `${templateName}.hbs`);
  const templateFile = await readFile(filePath, 'utf-8');
  const template = Handlebars.compile(templateFile);
  return template(data);
}
