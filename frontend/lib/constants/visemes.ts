// Enhanced ARPAbet phoneme to Oculus viseme mapping for accurate lip sync
export const PHONEME_TO_VISEME: Record<string, string> = {
  // Vowels - open mouth shapes
  'AA': 'aa',  // father - wide open
  'AE': 'aa',  // cat - wide open
  'AH': 'aa',  // but - neutral open
  'AO': 'O',   // dog - rounded
  'AW': 'O',   // how - rounded
  'AY': 'aa',  // my - open to close
  'EH': 'E',   // bed - slightly open
  'ER': 'E',   // bird - slightly rounded
  'EY': 'E',   // say - slightly open
  'IH': 'I',   // bit - narrow
  'IY': 'I',   // beat - narrow smile
  'OW': 'O',   // go - rounded
  'OY': 'O',   // boy - rounded
  'UH': 'U',   // book - rounded narrow
  'UW': 'U',   // boot - rounded narrow
  
  // Consonants - lip/tongue positions
  'B': 'PP',   // lips together
  'P': 'PP',   // lips together
  'M': 'PP',   // lips together
  'F': 'FF',   // teeth on lip
  'V': 'FF',   // teeth on lip
  'TH': 'TH',  // tongue between teeth
  'DH': 'TH',  // tongue between teeth
  'S': 'SS',   // teeth close
  'Z': 'SS',   // teeth close
  'SH': 'CH',  // lips forward
  'ZH': 'CH',  // lips forward
  'CH': 'CH',  // lips forward
  'JH': 'CH',  // lips forward
  'T': 'DD',   // tongue to teeth
  'D': 'DD',   // tongue to teeth
  'N': 'DD',   // tongue to teeth
  'L': 'DD',   // tongue to teeth
  'K': 'kk',   // back of tongue
  'G': 'kk',   // back of tongue
  'NG': 'kk',  // back of tongue
  'R': 'RR',   // lips slightly rounded
  'W': 'U',    // lips rounded
  'Y': 'I',    // lips spread
  'HH': 'sil', // silent/breath
  'SIL': 'sil' // silence
};
