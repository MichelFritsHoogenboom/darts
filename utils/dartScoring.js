// Dart scoring utilities

// All possible single dart scores
const SINGLE_SCORES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25 // 25 = bull
];

// All possible double scores (2x each number 1-20, plus double bull = 50)
const DOUBLE_SCORES = [
  2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 50
];

// All possible triple scores (3x each number 1-20)
const TRIPLE_SCORES = [
  3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60
];

// All possible dart scores in one throw
const ALL_DART_SCORES = [...new Set([...SINGLE_SCORES, ...DOUBLE_SCORES, ...TRIPLE_SCORES])].sort((a, b) => a - b);

// Generate all possible 3-dart combinations
function generateAllPossibleScores() {
  const possibleScores = new Set();
  
  // Single dart
  ALL_DART_SCORES.forEach(score => {
    possibleScores.add(score);
  });
  
  // Two darts
  ALL_DART_SCORES.forEach(first => {
    ALL_DART_SCORES.forEach(second => {
      possibleScores.add(first + second);
    });
  });
  
  // Three darts
  ALL_DART_SCORES.forEach(first => {
    ALL_DART_SCORES.forEach(second => {
      ALL_DART_SCORES.forEach(third => {
        possibleScores.add(first + second + third);
      });
    });
  });
  
  return Array.from(possibleScores).sort((a, b) => a - b);
}

// Cache all possible scores
const ALL_POSSIBLE_SCORES = generateAllPossibleScores();

// Check if a score is achievable with 3 darts
export function isAchievableScore(score) {
  return ALL_POSSIBLE_SCORES.includes(score);
}

// Get checkout suggestions for a given score
export function getCheckoutSuggestions(score) {
  if (score > 170) return [];
  
  // Complete list of all possible checkouts
  const checkoutPatterns = {
    170: ["T20 T20 Bull"],
    167: ["T20 T19 Bull"],
    164: ["T20 T18 Bull", "T19 T19 Bull"],
    161: ["T20 T17 Bull"],
    160: ["T20 T20 D20"],
    158: ["T20 T20 D19"],
    157: ["T20 T19 D20"],
    156: ["T20 T20 D18"],
    155: ["T20 T19 D19"],
    154: ["T20 T18 D20", "T19 T19 D20"],
    153: ["T20 T19 D18"],
    152: ["T20 T20 D16"],
    151: ["T20 T17 D20", "T19 T18 D20"],
    150: ["T20 T18 D18", "T19 T19 D18", "Bull Bull Bull"],
    149: ["T20 T19 D16"],
    148: ["T20 T20 D14", "T19 T17 D20"],
    147: ["T20 T17 D18", "T19 T18 D18"],
    146: ["T20 T18 D16", "T19 T19 D16"],
    145: ["T20 T15 D20", "T20 T19 D14"],
    144: ["T20 T20 D12"],
    143: ["T20 T17 D16", "T19 T18 D16"],
    142: ["T20 T14 D20", "T19 T19 D14"],
    141: ["T20 T19 D12"],
    140: ["T20 T20 D10"],
    139: ["T19 T14 D20", "T20 T13 D20", "T20 T19 D11"],
    138: ["T20 T18 D12", "T19 T19 D12"],
    137: ["T20 T19 D10"],
    136: ["T20 T20 D8"],
    135: ["T20 T17 D12", "SBull T20 Bull"],
    134: ["T20 T14 D16", "T20 T16 D13"],
    133: ["T20 T19 D8"],
    132: ["T20 T16 D12"],
    131: ["T20 T13 D16", "T19 T14 D16"],
    130: ["T20 T20 D5"],
    129: ["T19 T16 D12", "T20 T19 D6"],
    128: ["T18 T14 D16", "T20 T18 D7"],
    127: ["T20 T17 D8"],
    126: ["T19 T19 D6"],
    125: ["SBull T20 D20", "T18 T19 D7", "T20 T15 D10"],
    124: ["T20 T16 D8", "T20 T14 D11"],
    123: ["T19 T16 D9"],
    122: ["T18 T20 D4", "T18 T18 D7"],
    121: ["T17 T10 D20", "T20 T11 D14", "T17 T20 D5"],
    120: ["T20 S20 D20", "T20 T20 D0"],
    119: ["T19 T10 D16", "T19 T12 D13"],
    118: ["T20 S18 D20"],
    117: ["T20 S17 D20", "T19 S20 D20"],
    116: ["T20 S16 D20", "T19 S19 D20"],
    115: ["T20 S15 D20", "T19 S18 D20"],
    114: ["T20 S14 D20", "T19 S17 D20"],
    113: ["T19 S16 D20"],
    112: ["T20 S20 D16", "T20 T12 D8"],
    111: ["T20 S19 D16", "T19 S14 D20"],
    110: ["T20 S18 D16", "T20 T10 D10", "T19 S13 D20", "T20 Bull"],
    109: ["T19 S20 D16", "T20 S9 D20", "T19 T12 D8"],
    108: ["T20 S16 D16"],
    107: ["T19 S18 D16"],
    106: ["T20 S14 D16", "T20 T10 D8"],
    105: ["T19 S16 D16", "T20 S13 D16"],
    104: ["T18 S18 D16", "T19 S15 D16", "T18 Bull"],
    103: ["T20 S3 D20", "T19 S10 D18", "T19 S6 D20"],
    102: ["T16 S14 D20", "T20 S10 D16"],
    101: ["T20 S1 D20", "T19 T12 D4"],
    100: ["T20 D20"],
    99: ["T19 S10 D16"],
    98: ["T20 D19"],
    97: ["T19 D20"],
    96: ["T20 D18"],
    95: ["T19 D19", "SBull T20 D5"],
    94: ["T18 D20", "SBull T19 D6"],
    93: ["T19 D18", "SBull T18 D7"],
    92: ["T20 D16", "SBull T17 D8"],
    91: ["T17 D20", "SBull T16 D9"],
    90: ["T20 D15", "T18 D18"],
    89: ["T19 D16"],
    88: ["T20 D14"],
    87: ["T17 D18"],
    86: ["T18 D16"],
    85: ["T19 D14", "T15 D20"],
    84: ["T20 D12"],
    83: ["T17 D16"],
    82: ["T14 D20", "Bull D16"],
    81: ["T19 D12", "T15 D18"],
    80: ["T20 D10", "T16 D16"],
    79: ["T19 D11", "T13 D20"],
    78: ["T18 D12"],
    77: ["T19 D10", "T15 D16"],
    76: ["T16 D14", "T20 D8"],
    75: ["T17 D12"],
    74: ["T16 D13"],
    73: ["T19 D8"],
    72: ["T16 D12", "T20 D6"],
    71: ["T13 D16", "T19 D7"],
    70: ["T18 D8", "T20 D5"],
    69: ["T19 D6"],
    68: ["T16 D10"],
    67: ["T17 D8", "T9 D20"],
    66: ["T10 D18", "T16 D9"],
    65: ["T11 D16", "T15 D10"],
    64: ["T16 D8", "T14 D11"],
    63: ["T17 D6", "T13 D12"],
    62: ["T10 D16", "T12 D13"],
    61: ["T15 D8", "T11 D14"],
    60: ["S20 D20"],
    59: ["S19 D20"],
    58: ["S18 D20"],
    57: ["S17 D20"],
    56: ["S16 D20", "T16 D4"],
    55: ["S15 D20"],
    54: ["S14 D20"],
    53: ["S13 D20", "S17 D18"],
    52: ["S20 D16", "T12 D8"],
    51: ["S19 D16", "S11 D20", "S15 D18"],
    50: ["S18 D16", "S10 D20", "Bull"],
    49: ["S17 D16", "S9 D20"],
    48: ["S16 D16", "S8 D20"],
    47: ["S15 D16", "S7 D20"],
    46: ["S14 D16", "S6 D20", "S10 D18"],
    45: ["S13 D16", "S5 D20"],
    44: ["S12 D16", "S4 D20"],
    43: ["S11 D16", "S3 D20"],
    42: ["S10 D16", "S6 D18"],
    41: ["S9 D16"],
    40: ["D20"],
    39: ["S7 D16", "S19 D10"],
    38: ["D19"],
    37: ["S5 D16"],
    36: ["D18"],
    35: ["S3 D16"],
    34: ["D17"],
    33: ["S1 D16", "S17 D8"],
    32: ["D16"],
    31: ["S15 D8", "S7 D12"],
    30: ["D15"],
    29: ["S13 D8"],
    28: ["D14"],
    27: ["S19 D4", "S7 D10"],
    26: ["D13"],
    25: ["S17 D4", "S9 D8"],
    24: ["D12"],
    23: ["S7 D8"],
    22: ["D11"],
    21: ["S5 D8", "S17 D2"],
    20: ["D10"],
    19: ["S11 D4", "S3 D8"],
    18: ["D9"],
    17: ["S9 D4"],
    16: ["D8"],
    15: ["S7 D4"],
    14: ["D7"],
    13: ["S5 D4"],
    12: ["D6"],
    11: ["S3 D4"],
    10: ["D5"],
    9: ["S1 D4"],
    8: ["D4"],
    7: ["S3 D2"],
    6: ["D3"],
    5: ["S1 D2"],
    4: ["D2"],
    3: ["S1 D1"],
    2: ["D1"]
  };
  
  return checkoutPatterns[score] || [];
}

// Get the current player's checkout status
export function getCheckoutStatus(score) {
  if (score > 170) return { isCheckout: false, suggestions: [] };
  if (score <= 2) return { isCheckout: false, suggestions: [] };
  
  const suggestions = getCheckoutSuggestions(score);
  return {
    isCheckout: suggestions.length > 0,
    suggestions: suggestions
  };
}
