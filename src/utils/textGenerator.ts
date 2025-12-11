const commonAmharicWords = [
    "ሰላም", "እንዴት", "ነህ", "አለህ", "እኔ", "ደህና", "ነኝ", "አመሰግናለሁ", "ቤት", "ትምህርት",
    "ስራ", "መኪና", "መንገድ", "ከተማ", "ሀገር", "ኢትዮጵያ", "አዲስ", "አበባ", "ቡና", "ሻይ",
    "ምግብ", "ውሃ", "ሰው", "ሴት", "ወንድ", "ልጅ", "አባት", "እናት", "ወንድም", "እህት",
    "ጓደኛ", "ፍቅር", "ሰላም", "ጤና", "ደስታ", "ህይወት", "ጊዜ", "ቀን", "ሌሊት", "ጠዋት",
    "ማታ", "ዛሬ", "ነገ", "ትናንት", "ሳምንት", "ወር", "አመት", "መጽሐፍ", "ብዕር", "ወረቀት",
    "ኮምፒውተር", "ስልክ", "ኢንተርኔት", "ፌስቡክ", "ቴሌግራም", "ዩቲዩብ", "ጉግል", "አማርኛ", "ቋንቋ", "ፊደል",
    "ትምህርት", "ቤት", "መምህር", "ተማሪ", "ክፍል", "ፈተና", "ውጤት", "ጥያቄ", "መልስ", "እውቀት",
    "ጥበብ", "ሳይንስ", "ቴክኖሎጂ", "ባህል", "ታሪክ", "ፖለቲካ", "ኢኮኖሚ", "ንግድ", "ገበያ", "ገንዘብ",
    "ባንክ", "ሆስፒታል", "ሐኪም", "መድሃኒት", "በሽታ", "ቫይረስ", "ኮሮና", "ክትባት", "ማስክ", "ርቀት",
    "ንጽህና", "ውበት", "ጥሩ", "መጥፎ", "ትልቅ", "ትንሽ", "ረጅም", "አጭር", "ወፍራም", "ቀጭን"
];

const commonEnglishWords = [
    "the", "be", "of", "and", "a", "to", "in", "he", "have", "it",
    "that", "for", "they", "I", "with", "as", "not", "on", "she", "at",
    "by", "this", "we", "you", "do", "but", "from", "or", "which", "one",
    "would", "all", "will", "there", "say", "who", "make", "when", "can", "more",
    "if", "no", "man", "out", "other", "so", "what", "time", "up", "go",
    "about", "than", "into", "could", "state", "only", "new", "year", "some", "take",
    "come", "these", "know", "see", "use", "get", "like", "then", "first", "any",
    "work", "now", "may", "such", "give", "over", "think", "most", "even", "find",
    "day", "also", "after", "way", "many", "must", "look", "before", "great", "back",
    "through", "long", "where", "much", "should", "well", "people", "down", "own", "just",
    "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place",
    "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write",
    "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop",
    "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another",
    "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point"
];

export type Language = 'amharic' | 'english';

export const generateText = (wordCount: number = 25, language: Language = 'amharic'): string => {
    const words: string[] = [];
    const sourceWords = language === 'amharic' ? commonAmharicWords : commonEnglishWords;

    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * sourceWords.length);
        words.push(sourceWords[randomIndex]);
    }
    return words.join(" ");
};
