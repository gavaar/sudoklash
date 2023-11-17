import { Injectable } from '@angular/core';
import { English, Language, Spanish } from './supported_languages';

const SUPPORTED_LANGUAGES = [
  ['english', new English],
  ['spanish', new Spanish],
] as const;

// this service exists for the sole purpose of avoiding i18n from angular.
// Meanwhile, a simple object map should be enough.
@Injectable({ providedIn: 'root' })
export class LanguageService {
  languages = SUPPORTED_LANGUAGES.map(lang => lang[0]);
  selectedLanguage: typeof SUPPORTED_LANGUAGES[number][1];

  private languageOptions: Map<typeof SUPPORTED_LANGUAGES[number][0], Language>;

  constructor() {
    this.languageOptions = new Map();
    this.languageOptions.set('english', new English);
    this.languageOptions.set('spanish', new Spanish);

    this.selectedLanguage = this.languageOptions.get(this.languages[0])!;
  }

}
