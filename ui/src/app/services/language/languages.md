# Languages module

For simplicity, I decided tu support languages by manually writing objects with pieces of information, and translating them manually.

This is because I don't want to deal with the hassle of implementing `@angular/internationalization`and having to do weird attribute stuff.

## How to implement a new piece of text / new language

There's an abstract class `Language` in `supported_languages/language.abstract.ts`. It implements all the pieces of text with an unique id each about what it's about.

The id'ing of the pieces of text are done in relation to where they are located. So a text inside a room in the header would be something like

`selectedLanguage.room_game_header_info`. By applying these properties to the abstract class, all languages will ask to fill these values, which will allow for coherence.

## The service

The service was thought with the idea that you just take `langService.selectedLanguage.my_route_element_id` and that's the piece of text you want to apply there.

## Nice to have's

If there's time later: Add lazy loading to all the different languages, so user only downloads the one he will use (preferably when it get's used, meaning routing, etc).
Or even better, apply proper angular i18n, but eww. It would even move us towards just supporting english and allow users to use Google Translate and fuck it.
