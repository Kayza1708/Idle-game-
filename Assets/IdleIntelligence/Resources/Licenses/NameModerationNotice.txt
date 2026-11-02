# Name moderation vocabulary

Adapted from **List of Dirty, Naughty, Obscene, and Otherwise Bad Words**, © 2012–2020 Shutterstock, Inc. and contributors.
Source: https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/tree/5faf2ba42d7b1c0977169ec3611df25a3c08eb13
Upstream revision: `5faf2ba42d7b1c0977169ec3611df25a3c08eb13`; retrieved 2026-10-18 UTC.
License: Creative Commons Attribution 4.0 International, https://creativecommons.org/licenses/by/4.0/. Full text shipped with the app at `public/licenses/name-moderation.txt`; attribution is linked from Settings → Licenses.

Changes: selected ten languages; removed neutral identity terms, ordinary nouns, common personal names and ambiguous autocomplete keywords; added colloquial insults and native Hindi/Arabic/Chinese variants. `blockedTerms.json` is the maintained in-game list. `reservedNames.json` is a separate, manually maintained list of political public-figure names and extremist slogans; it is not provided by upstream. No politician list can identify every public figure.

Short and ambiguous vocabulary uses whole-token matching. Strong, explicitly reviewed phrases also match inside decorated names. The filter is a local precheck, not a replacement for server validation, reports, appeals and moderation before any future social release. Do not block neutral identities, religions, nationalities or sexual orientations as profanity.
