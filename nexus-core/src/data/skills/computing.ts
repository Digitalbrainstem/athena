import { topic, chain, skill } from './types.js';
import type { SkillNode } from './types.js';

const CS = 'computer-science';
const ENG = 'engineering';
const CF = 'code-forge';
const DW = 'digital-world';
const WS = 'workshop';
const AD = 'architects-domain';
const SY = 'shipyard';

// ===========================================================================
// COMPUTER SCIENCE — FOUNDATION  (~40 skills)
// Ages 2–5: Unplugged computing, digital literacy, internet safety
// ===========================================================================

const csFoundation: SkillNode[] = [

  // ---- Preserved entry-point skills ----
  skill('cs.computational-thinking', 'Computational Thinking', CS, 'foundation',
    ['math.patterns', 'language.reading'],
    'Break problems into steps a computer could follow', [CF, DW]),
  skill('cs.sequencing', 'Sequencing', CS, 'foundation',
    ['cs.computational-thinking'],
    'Arrange instructions in the correct order to achieve a goal', [CF, DW]),
  skill('cs.loops', 'Loops', CS, 'foundation',
    ['cs.sequencing', 'math.patterns'],
    'Recognise and use repeated patterns of instructions', [CF, DW]),
  skill('cs.conditionals', 'Conditionals', CS, 'foundation',
    ['cs.sequencing', 'math.number-comparison'],
    'Make choices in a sequence based on yes-or-no questions', [CF, DW]),
  skill('cs.decomposition', 'Decomposition', CS, 'foundation',
    ['cs.computational-thinking'],
    'Break a big problem into smaller, manageable parts', [CF, DW]),
  skill('cs.pattern-recognition', 'Pattern Recognition', CS, 'foundation',
    ['cs.computational-thinking', 'math.patterns'],
    'Spot similarities and repeating elements in problems', [CF, DW]),

  // ---- Unplugged computing (12) ----
  ...topic('cs.unplugged', CS, 'foundation', [CF, DW], [
    ['sorting-game', 'Sorting Game', ['cs.sequencing'], 'Sort objects by size, colour, or shape without a computer'],
    ['binary-cards', 'Binary Cards', ['cs.pattern-recognition'], 'Use flip cards to represent numbers in binary'],
    ['pattern-beads', 'Pattern Beads', ['cs.pattern-recognition'], 'Thread beads in repeating patterns to build algorithmic thinking'],
    ['algorithm-dance', 'Algorithm Dance', ['cs.sequencing'], 'Follow and create dance move sequences as algorithms'],
    ['maze-directions', 'Maze Directions', ['cs.sequencing'], 'Guide a friend through a maze using only verbal instructions'],
    ['pixel-art', 'Pixel Art', ['cs.pattern-recognition'], 'Colour grid squares to understand how images are stored digitally'],
    ['treasure-map', 'Treasure Map', ['cs.sequencing'], 'Write step-by-step directions to find hidden treasure'],
    ['robot-commands', 'Robot Commands', ['cs.sequencing', 'cs.loops'], 'Program a human robot with instruction cards'],
    ['secret-codes', 'Secret Codes', ['cs.pattern-recognition'], 'Encode and decode messages using simple substitution ciphers'],
    ['story-sequence', 'Story Sequencing', ['cs.sequencing'], 'Arrange story event cards in the right order like a program'],
    ['counting-binary', 'Counting in Binary', ['binary-cards'], 'Count from zero to thirty-one using five fingers as bits'],
    ['color-by-number', 'Colour by Number Code', ['pixel-art'], 'Use run-length encoding to compress pixel art drawings'],
  ]),

  // ---- Digital literacy (14) ----
  ...topic('cs.digital-literacy', CS, 'foundation', [DW], [
    ['devices', 'Using Devices', [], 'Power on and navigate tablets, laptops, and desktops'],
    ['mouse-click', 'Mouse Clicking', ['devices'], 'Point and click accurately with a mouse or trackpad'],
    ['mouse-drag', 'Mouse Dragging', ['mouse-click'], 'Click, hold, and drag objects across the screen'],
    ['touchscreen', 'Touchscreen Basics', ['devices'], 'Tap, swipe, and pinch on a touchscreen device'],
    ['keyboard-letters', 'Keyboard Letters', ['devices'], 'Find and press letter keys to type words'],
    ['keyboard-special', 'Special Keys', ['keyboard-letters'], 'Use space, enter, backspace, and shift keys correctly'],
    ['typing-name', 'Typing Your Name', ['keyboard-letters'], 'Type your own name confidently using the keyboard'],
    ['file-open', 'Opening Files', ['mouse-click'], 'Find and open files and programs on a device'],
    ['file-save', 'Saving Work', ['file-open'], 'Save creations so they can be found again later'],
    ['icons', 'Understanding Icons', ['devices'], 'Recognise common icons and understand what they represent'],
    ['apps', 'Using Apps', ['icons', 'mouse-click'], 'Open, use, and close applications on a device'],
    ['folders', 'Folders & Organisation', ['file-save'], 'Create folders and organise files neatly'],
    ['screenshots', 'Taking Screenshots', ['keyboard-special'], 'Capture what is on the screen as an image'],
    ['undo-redo', 'Undo and Redo', ['keyboard-special'], 'Use undo and redo to fix mistakes and experiment freely'],
  ]),

  // ---- Internet safety (8) ----
  ...topic('cs.internet-safety', CS, 'foundation', [DW], [
    ['stranger-danger', 'Online Strangers', ['cs.digital-literacy.devices'], 'Understand that not everyone online is who they say they are'],
    ['passwords-intro', 'Password Basics', ['cs.digital-literacy.keyboard-letters'], 'Create and remember a simple password to protect accounts'],
    ['personal-info', 'Personal Information', ['stranger-danger'], 'Know which information should never be shared online'],
    ['ask-adult', 'Ask an Adult', ['stranger-danger'], 'Know when to ask a trusted adult for help online'],
    ['screen-breaks', 'Screen Breaks', ['cs.digital-literacy.devices'], 'Understand why regular breaks from screens are important'],
    ['kind-words', 'Kind Words Online', ['cs.digital-literacy.devices'], 'Use respectful and kind language in digital interactions'],
    ['trusted-sites', 'Trusted Sites', ['cs.digital-literacy.apps'], 'Identify safe websites and apps approved by adults'],
    ['privacy-basics', 'Privacy Basics', ['personal-info'], 'Understand that privacy means controlling who sees your information'],
  ]),
];

// ===========================================================================
// COMPUTER SCIENCE — DISCOVERY  (~130 skills)
// Grades K–2: Computational thinking, block coding, binary, internet, typing
// ===========================================================================

const csDiscovery: SkillNode[] = [

  // ---- Preserved skills ----
  skill('cs.variables', 'Variables', CS, 'discovery',
    ['cs.sequencing', 'math.variables'],
    'Store and retrieve values that can change over time', [CF, DW]),
  skill('cs.data-types', 'Data Types', CS, 'discovery',
    ['cs.variables'],
    'Distinguish between numbers, text, and true/false values', [CF, DW]),
  skill('cs.operators', 'Operators', CS, 'discovery',
    ['cs.variables', 'math.order-of-operations'],
    'Use arithmetic, comparison, and logical operators on values', [CF, DW]),
  skill('cs.debugging', 'Debugging', CS, 'discovery',
    ['cs.sequencing', 'cs.conditionals'],
    'Find and fix mistakes in a sequence of instructions', [CF, DW]),

  // ---- Computational thinking – deep dive (12) ----
  ...topic('cs.ct', CS, 'discovery', [CF, DW], [
    ['abstraction', 'Abstraction', ['cs.decomposition'], 'Hide unnecessary details and focus on what matters'],
    ['generalization', 'Generalisation', ['cs.pattern-recognition'], 'Apply a solution from one problem to similar problems'],
    ['algorithm-design', 'Algorithm Design', ['cs.sequencing', 'cs.loops'], 'Create step-by-step procedures to solve specific tasks'],
    ['efficiency', 'Efficiency Awareness', ['algorithm-design'], 'Notice that some solutions are faster than others'],
    ['logical-reasoning', 'Logical Reasoning', ['cs.conditionals'], 'Use if-then thinking to predict outcomes of instructions'],
    ['modeling', 'Simple Modelling', ['abstraction'], 'Represent real-world situations as simplified models'],
    ['simulation', 'Simulation', ['modeling'], 'Run a model step by step to see what happens'],
    ['evaluation', 'Evaluating Solutions', ['algorithm-design'], 'Judge whether a solution is correct and could be improved'],
    ['data-collection', 'Data Collection', ['cs.variables'], 'Gather information systematically to answer a question'],
    ['data-analysis', 'Data Analysis', ['data-collection'], 'Look for patterns and meaning in collected data'],
    ['automation', 'Automation Thinking', ['cs.loops', 'algorithm-design'], 'Identify tasks that can be done automatically by a computer'],
    ['visualization', 'Data Visualisation', ['data-analysis'], 'Represent data as pictures, charts, or graphs to find insights'],
  ]),

  // ---- Block coding (25) ----
  ...topic('cs.blocks', CS, 'discovery', [CF], [
    ['intro', 'Block Coding Intro', ['cs.sequencing'], 'Snap together instruction blocks to make a program'],
    ['motion', 'Motion Blocks', ['intro'], 'Move sprites around the screen using motion blocks'],
    ['looks', 'Looks Blocks', ['intro'], 'Change a sprite appearance, size, and visibility'],
    ['events', 'Event Blocks', ['intro'], 'Start programs with green-flag, key-press, and click events'],
    ['sequences', 'Block Sequences', ['motion', 'events'], 'Build multi-step programs by chaining blocks together'],
    ['repeat-loops', 'Repeat Loops', ['sequences', 'cs.loops'], 'Use repeat blocks to run instructions multiple times'],
    ['count-loops', 'Count Loops', ['repeat-loops'], 'Repeat a set number of times using a counter'],
    ['if-blocks', 'If Blocks', ['sequences', 'cs.conditionals'], 'Add decision points that check a condition before running'],
    ['if-else', 'If-Else Blocks', ['if-blocks'], 'Choose between two paths based on a condition'],
    ['variables-in-blocks', 'Variables in Blocks', ['sequences', 'cs.variables'], 'Create and use variable blocks to track scores and values'],
    ['operators-in-blocks', 'Operators in Blocks', ['variables-in-blocks', 'cs.operators'], 'Perform arithmetic and comparisons inside block programs'],
    ['broadcast', 'Broadcast Messages', ['events'], 'Send and receive messages between sprites to coordinate actions'],
    ['animation', 'Simple Animation', ['looks', 'repeat-loops'], 'Create frame-by-frame animations with costume changes and loops'],
    ['sprite-interaction', 'Sprite Interaction', ['broadcast', 'if-blocks'], 'Make sprites respond when they touch each other'],
    ['sound-blocks', 'Sound Blocks', ['intro'], 'Play sounds and music in block programs'],
    ['pen-drawing', 'Pen Drawing', ['motion', 'repeat-loops'], 'Draw shapes and patterns by moving a sprite with the pen down'],
    ['cloning', 'Cloning Sprites', ['sprite-interaction'], 'Create copies of sprites at runtime for dynamic effects'],
    ['custom-blocks', 'Custom Blocks', ['sequences', 'cs.decomposition'], 'Define reusable custom blocks to organise code'],
    ['interactive-story', 'Interactive Story', ['if-else', 'broadcast'], 'Build a story where the reader makes choices that change the plot'],
    ['simple-game', 'Simple Game', ['sprite-interaction', 'variables-in-blocks'], 'Create a complete game with rules, scoring, and win conditions'],
    ['score-tracking', 'Score Tracking', ['variables-in-blocks'], 'Use variables to keep track of points and display the score'],
    ['timer', 'Timer Mechanics', ['variables-in-blocks', 'repeat-loops'], 'Implement countdown timers and timed challenges'],
    ['random-events', 'Random Events', ['operators-in-blocks'], 'Use random number blocks to add surprise and variety'],
    ['user-input', 'User Input', ['variables-in-blocks'], 'Ask the user questions and store their answers in variables'],
    ['multi-sprite', 'Multi-Sprite Projects', ['broadcast', 'cloning'], 'Coordinate many sprites working together in one project'],
  ]),

  // ---- Binary & data representation (15) ----
  ...topic('cs.binary', CS, 'discovery', [CF, DW], [
    ['bits', 'Bits', ['cs.pattern-recognition'], 'Understand that a bit is the smallest unit of data: 0 or 1'],
    ['on-off', 'On and Off', ['bits'], 'Connect binary 0/1 to on/off, true/false, and yes/no'],
    ['counting', 'Binary Counting', ['on-off', 'math.counting'], 'Count in binary using place values that double'],
    ['nibble', 'Nibbles', ['counting'], 'Group four bits into a nibble and read its value'],
    ['byte', 'Bytes', ['nibble'], 'Understand that eight bits make a byte — the basic unit of storage'],
    ['conversion', 'Binary Conversion', ['byte'], 'Convert numbers between binary and decimal representations'],
    ['addition', 'Binary Addition', ['conversion'], 'Add two binary numbers using carry rules'],
  ]),
  ...topic('cs.data-rep', CS, 'discovery', [CF, DW], [
    ['ascii-intro', 'ASCII Introduction', ['cs.binary.byte'], 'Learn how letters and symbols are represented as numbers'],
    ['text-encoding', 'Text Encoding', ['ascii-intro'], 'Understand character encoding and how text is stored digitally'],
    ['color-rgb', 'RGB Colour Model', ['cs.binary.byte'], 'Represent colours using red, green, and blue number values'],
    ['image-pixels', 'Image Pixels', ['color-rgb'], 'Understand that images are grids of coloured pixels'],
    ['sound-digital', 'Digital Sound', ['cs.binary.bits'], 'Learn how sound waves are sampled and stored as numbers'],
    ['file-sizes', 'File Sizes', ['cs.binary.byte'], 'Compare kilobytes, megabytes, and gigabytes of storage'],
    ['compression-intro', 'Compression Introduction', ['file-sizes'], 'Understand why and how files are made smaller for storage'],
    ['analog-digital', 'Analogue vs Digital', ['sound-digital', 'image-pixels'], 'Compare continuous analogue signals with discrete digital data'],
  ]),

  // ---- Internet basics (12) ----
  ...topic('cs.internet', CS, 'discovery', [DW], [
    ['what-is', 'What Is the Internet', ['cs.digital-literacy.devices'], 'Understand the internet as a global network of connected computers'],
    ['networks', 'Networks', ['what-is'], 'Learn that computers connect in networks to share information'],
    ['wifi', 'Wi-Fi', ['networks'], 'Understand how wireless signals connect devices to networks'],
    ['websites', 'Websites', ['what-is'], 'Know that websites are pages of information stored on servers'],
    ['urls', 'URLs', ['websites'], 'Read and understand web addresses to find specific pages'],
    ['browsers', 'Web Browsers', ['websites'], 'Use a browser to navigate, bookmark, and manage tabs'],
    ['search-engines', 'Search Engines', ['browsers'], 'Use search engines effectively to find information online'],
    ['email-basics', 'Email Basics', ['what-is'], 'Send, receive, and reply to email messages safely'],
    ['downloading', 'Downloading', ['browsers'], 'Download files safely and find them on the device'],
    ['cloud-intro', 'Cloud Introduction', ['networks'], 'Understand that the cloud stores data on remote servers'],
    ['streaming', 'Streaming', ['networks'], 'Understand how video and music are delivered over the internet'],
    ['data-travel', 'How Data Travels', ['networks'], 'Follow a packet of data as it moves across the internet'],
  ]),

  // ---- Typing (8) ----
  ...chain('cs.typing', CS, 'discovery', [CF], [
    ['home-row', 'Home Row', 'Place fingers on the home row keys and type them accurately'],
    ['left-hand', 'Left Hand Keys', 'Type all keys reached by the left hand from home position'],
    ['right-hand', 'Right Hand Keys', 'Type all keys reached by the right hand from home position'],
    ['top-row', 'Top Row', 'Reach up to the top row and return to home row smoothly'],
    ['bottom-row', 'Bottom Row', 'Reach down to the bottom row and return to home row'],
    ['numbers', 'Number Row', 'Type numbers and common symbols from the number row'],
    ['speed-20wpm', 'Speed 20 WPM', 'Type at twenty words per minute with proper technique'],
    ['accuracy', 'Accuracy Focus', 'Achieve ninety-five percent accuracy while maintaining speed'],
  ], ['cs.digital-literacy.keyboard-letters']),

  // ---- Digital citizenship (14) ----
  ...topic('cs.citizenship', CS, 'discovery', [DW], [
    ['digital-footprint', 'Digital Footprint', ['cs.internet.what-is'], 'Understand that online actions leave a permanent trail'],
    ['online-identity', 'Online Identity', ['digital-footprint'], 'Manage how you present yourself in digital spaces'],
    ['cyberbullying', 'Cyberbullying Awareness', ['cs.internet-safety.kind-words'], 'Recognise cyberbullying and know how to respond'],
    ['reporting', 'Reporting Problems', ['cyberbullying'], 'Know how and when to report harmful online content'],
    ['copyright', 'Copyright Basics', ['cs.internet.websites'], 'Understand that creative works belong to their creators'],
    ['creative-commons', 'Creative Commons', ['copyright'], 'Use and share works under Creative Commons licences'],
    ['credible-sources', 'Credible Sources', ['cs.internet.search-engines'], 'Evaluate whether online information is trustworthy'],
    ['media-literacy', 'Media Literacy', ['credible-sources'], 'Analyse images, videos, and articles for bias and accuracy'],
    ['screen-time', 'Screen Time Balance', ['cs.internet-safety.screen-breaks'], 'Monitor and balance time spent on screens'],
    ['wellness', 'Digital Wellness', ['screen-time'], 'Build healthy habits around technology use'],
    ['respectful-comm', 'Respectful Communication', ['cs.internet-safety.kind-words'], 'Communicate thoughtfully and respectfully in digital spaces'],
    ['sharing-safely', 'Sharing Safely', ['cs.internet-safety.personal-info'], 'Share content online without revealing private information'],
    ['phishing', 'Phishing Awareness', ['cs.internet-safety.passwords-intro'], 'Spot fake emails and websites that try to steal information'],
    ['strong-passwords', 'Strong Passwords', ['cs.internet-safety.passwords-intro'], 'Create strong, unique passwords and manage them safely'],
  ]),

  // ---- Text coding introduction (10) ----
  ...topic('cs.text-intro', CS, 'discovery', [CF], [
    ['print', 'Print Statements', ['cs.blocks.intro', 'cs.variables'], 'Write text code that displays messages on screen'],
    ['comments', 'Code Comments', ['print'], 'Add comments to explain what code does for future readers'],
    ['simple-vars', 'Text Variables', ['print', 'cs.variables'], 'Declare and assign variables in a text-based language'],
    ['simple-math', 'Text Arithmetic', ['simple-vars', 'cs.operators'], 'Perform calculations in text code using arithmetic operators'],
    ['simple-strings', 'Text Strings', ['simple-vars'], 'Create and join text strings in a text-based language'],
    ['io', 'Input and Output', ['simple-vars'], 'Read user input and display output in the console'],
    ['simple-if', 'Text If Statements', ['simple-vars', 'cs.conditionals'], 'Write if and if-else statements in a text-based language'],
    ['simple-loop', 'Text Loops', ['simple-vars', 'cs.loops'], 'Write for and while loops in a text-based language'],
    ['simple-function', 'Text Functions', ['simple-loop', 'cs.decomposition'], 'Define and call simple functions in a text-based language'],
    ['simple-list', 'Text Lists', ['simple-vars', 'cs.loops'], 'Create and iterate through lists in a text-based language'],
  ]),

  // ---- Logic (10) ----
  ...topic('cs.logic', CS, 'discovery', [CF, DW], [
    ['true-false', 'True and False', ['cs.conditionals'], 'Understand Boolean values as the basis of all logic'],
    ['and-op', 'AND Operator', ['true-false'], 'Combine conditions where both must be true'],
    ['or-op', 'OR Operator', ['true-false'], 'Combine conditions where at least one must be true'],
    ['not-op', 'NOT Operator', ['true-false'], 'Invert a condition from true to false or vice versa'],
    ['compound', 'Compound Conditions', ['and-op', 'or-op'], 'Build complex conditions using multiple logical operators'],
    ['truth-tables', 'Truth Tables', ['compound'], 'Map every possible input combination to its output'],
    ['boolean-vars', 'Boolean Variables', ['true-false', 'cs.variables'], 'Store true/false values in variables for later use'],
    ['short-circuit', 'Short-Circuit Evaluation', ['compound'], 'Understand how computers skip unnecessary checks'],
    ['demorgan', 'De Morgan\'s Laws', ['not-op', 'compound'], 'Transform NOT-AND into OR-NOT and vice versa'],
    ['xor', 'XOR Operator', ['and-op', 'or-op', 'not-op'], 'Identify when exactly one of two conditions is true'],
  ]),

  // ---- Hardware basics (10) ----
  ...topic('cs.hardware', CS, 'discovery', [DW], [
    ['cpu', 'The CPU', ['cs.digital-literacy.devices'], 'Understand the processor as the brain that executes instructions'],
    ['memory-ram', 'RAM', ['cpu'], 'Learn that RAM holds data the CPU is actively using'],
    ['storage', 'Storage Devices', ['cpu'], 'Compare hard drives, SSDs, and flash drives for long-term storage'],
    ['input-devices', 'Input Devices', ['cs.digital-literacy.devices'], 'Identify keyboards, mice, microphones, and cameras as input'],
    ['output-devices', 'Output Devices', ['cs.digital-literacy.devices'], 'Identify monitors, speakers, and printers as output'],
    ['motherboard', 'The Motherboard', ['cpu'], 'Understand the motherboard as the main circuit connecting all parts'],
    ['gpu', 'The GPU', ['cpu'], 'Learn that graphics cards specialise in drawing images fast'],
    ['ports', 'Ports & Connectors', ['motherboard'], 'Identify USB, HDMI, and other ports on a computer'],
    ['peripherals', 'Peripherals', ['ports'], 'Connect and use external devices like printers and controllers'],
    ['binary-in-hardware', 'Binary in Hardware', ['cs.binary.bits', 'cpu'], 'Connect binary numbers to electrical signals inside a computer'],
  ]),

  // ---- Software concepts (10) ----
  ...topic('cs.software', CS, 'discovery', [DW], [
    ['what-is', 'What Is Software', ['cs.hardware.cpu'], 'Distinguish software instructions from physical hardware'],
    ['operating-systems', 'Operating Systems', ['what-is'], 'Understand the OS as the master program managing the computer'],
    ['applications', 'Applications', ['operating-systems'], 'Know that apps are programs built for specific tasks'],
    ['updates', 'Software Updates', ['applications'], 'Understand why software needs regular updates and patches'],
    ['install', 'Installing Software', ['applications'], 'Safely install and remove applications on a device'],
    ['file-types', 'File Types', ['applications'], 'Recognise common file extensions and their purposes'],
    ['file-management', 'File Management', ['file-types', 'cs.digital-literacy.folders'], 'Organise, move, copy, and delete files effectively'],
    ['backup', 'Backing Up Data', ['file-management'], 'Create backups to protect important files from loss'],
    ['open-source', 'Open Source', ['what-is'], 'Understand software whose code is freely shared and improved'],
    ['version-numbers', 'Version Numbers', ['updates'], 'Read version numbers to understand software releases'],
  ]),
];

// ===========================================================================
// COMPUTER SCIENCE — BUILDER  (~200 skills)
// Programming fundamentals, OOP, data structures, algorithms, web, databases
// ===========================================================================

const csBuilder: SkillNode[] = [

  // ---- Preserved standalone skills ----
  skill('cs.functions', 'Functions', CS, 'builder',
    ['cs.variables', 'cs.decomposition'],
    'Define reusable blocks of code that accept inputs and return outputs', [CF]),
  skill('cs.arrays', 'Arrays', CS, 'builder',
    ['cs.variables', 'cs.loops'],
    'Store and access ordered collections of values by index', [CF]),
  skill('cs.strings', 'Strings', CS, 'builder',
    ['cs.variables', 'language.reading'],
    'Manipulate sequences of characters to process text', [CF]),

  // ---- Programming fundamentals (28) ----
  ...topic('cs.prog', CS, 'builder', [CF], [
    ['variable-naming', 'Variable Naming', ['cs.variables'], 'Choose clear, descriptive names that make code self-documenting'],
    ['constants', 'Constants', ['cs.variables'], 'Declare values that never change to prevent accidental modification'],
    ['type-conversion', 'Type Conversion', ['cs.data-types'], 'Convert between numbers, strings, and booleans safely'],
    ['integer-ops', 'Integer Operations', ['cs.operators'], 'Perform addition, subtraction, multiplication, division, and modulo on integers'],
    ['float-ops', 'Floating-Point Operations', ['integer-ops'], 'Work with decimal numbers and understand precision limits'],
    ['boolean-ops', 'Boolean Operations', ['cs.logic.compound'], 'Combine conditions with AND, OR, and NOT in real programs'],
    ['comparison-ops', 'Comparison Operators', ['cs.operators'], 'Compare values with equal, not-equal, greater, and less operators'],
    ['string-concat', 'String Concatenation', ['cs.strings'], 'Join strings together and embed variables inside text'],
    ['if-else', 'If-Else Statements', ['cs.conditionals', 'cs.variables'], 'Branch program flow based on Boolean conditions'],
    ['else-if', 'Else-If Chains', ['if-else'], 'Handle multiple conditions in sequence with else-if branches'],
    ['switch-case', 'Switch Statements', ['else-if'], 'Select one of many code paths based on a single value'],
    ['while-loops', 'While Loops', ['cs.loops', 'cs.variables'], 'Repeat code while a condition remains true'],
    ['for-loops', 'For Loops', ['while-loops'], 'Iterate a known number of times using a counter variable'],
    ['nested-loops', 'Nested Loops', ['for-loops'], 'Place loops inside loops to process multi-dimensional data'],
    ['break-continue', 'Break and Continue', ['for-loops'], 'Exit a loop early or skip to the next iteration'],
    ['function-params', 'Function Parameters', ['cs.functions'], 'Pass values into functions as arguments'],
    ['return-values', 'Return Values', ['function-params'], 'Send computed results back from a function to the caller'],
    ['default-params', 'Default Parameters', ['function-params'], 'Provide fallback values when arguments are omitted'],
    ['scope', 'Variable Scope', ['cs.functions'], 'Understand where variables are accessible — local versus global'],
    ['closures', 'Closures', ['scope'], 'Capture surrounding variables inside a function for later use'],
    ['array-index', 'Array Indexing', ['cs.arrays'], 'Access individual elements by their zero-based position'],
    ['array-iterate', 'Array Iteration', ['cs.arrays', 'for-loops'], 'Loop through every element of an array in order'],
    ['array-modify', 'Array Modification', ['array-index'], 'Add, remove, and update elements in an array'],
    ['2d-arrays', 'Two-Dimensional Arrays', ['array-index', 'nested-loops'], 'Store and process grids of data using arrays of arrays'],
    ['string-methods', 'String Methods', ['cs.strings'], 'Use built-in methods to search, split, trim, and transform text'],
    ['input-validation', 'Input Validation', ['if-else'], 'Check user input for correctness before processing it'],
    ['error-handling', 'Error Handling', ['if-else'], 'Detect errors gracefully instead of crashing the program'],
    ['try-catch', 'Try-Catch Blocks', ['error-handling'], 'Wrap risky code in try-catch to recover from exceptions'],
  ]),

  // ---- OOP (15: 3 preserved + 12 new) ----
  ...topic('cs.oop', CS, 'builder', [CF], [
    ['basics', 'OOP Basics', ['cs.functions', 'cs.data-types'], 'Model the world with objects that bundle data and behaviour'],
    ['inheritance', 'Inheritance', ['basics'], 'Create new classes that extend and specialise existing ones'],
    ['polymorphism', 'Polymorphism', ['inheritance'], 'Call the same method on different types and get specialised behaviour'],
    ['classes', 'Classes', ['basics'], 'Define blueprints that describe what objects know and can do'],
    ['objects', 'Creating Objects', ['classes'], 'Instantiate classes into individual objects with their own data'],
    ['methods', 'Methods', ['classes'], 'Write functions that belong to a class and operate on its data'],
    ['properties', 'Properties', ['classes'], 'Define and access the data fields stored inside an object'],
    ['constructors', 'Constructors', ['classes'], 'Initialise an object state when it is first created'],
    ['encapsulation', 'Encapsulation', ['methods', 'properties'], 'Hide internal details and expose only a clean public interface'],
    ['access-modifiers', 'Access Modifiers', ['encapsulation'], 'Control visibility with public, private, and protected keywords'],
    ['abstract-classes', 'Abstract Classes', ['inheritance'], 'Define incomplete classes that subclasses must finish implementing'],
    ['interfaces', 'Interfaces', ['abstract-classes'], 'Specify a contract of methods that any implementing class must provide'],
    ['composition', 'Composition', ['objects'], 'Build complex objects by combining simpler ones instead of inheriting'],
    ['static-members', 'Static Members', ['classes'], 'Share data and methods across all instances of a class'],
    ['overloading', 'Method Overloading', ['methods'], 'Define multiple versions of a method with different parameter lists'],
  ]),

  // ---- Data structures (16: 4 preserved + 12 new) ----
  ...topic('cs.data-structures', CS, 'builder', [CF], [
    ['linked-lists', 'Linked Lists', ['cs.arrays', 'cs.oop.basics'], 'Chain nodes together so elements can be inserted anywhere efficiently'],
    ['trees', 'Trees', ['linked-lists'], 'Organise data in a hierarchy of parent and child nodes'],
    ['graphs', 'Graphs', ['trees', 'math.discrete.graph-theory'], 'Model connections between items as nodes and edges'],
    ['hash-tables', 'Hash Tables', ['cs.arrays', 'cs.functions'], 'Map keys to values for near-instant lookups'],
    ['stacks', 'Stacks', ['cs.arrays'], 'Use a last-in-first-out container for undo history and backtracking'],
    ['queues', 'Queues', ['cs.arrays'], 'Use a first-in-first-out container for fair ordering of tasks'],
    ['deques', 'Double-Ended Queues', ['queues'], 'Add and remove elements from both ends of a collection'],
    ['priority-queues', 'Priority Queues', ['queues'], 'Always retrieve the highest-priority element first'],
    ['sets', 'Sets', ['cs.arrays'], 'Store unique elements with fast membership testing'],
    ['maps', 'Maps', ['hash-tables'], 'Store key-value pairs with efficient lookup by key'],
    ['iterators', 'Iterators', ['cs.arrays', 'cs.oop.basics'], 'Step through a collection one element at a time without exposing internals'],
    ['tree-traversal', 'Tree Traversal', ['trees'], 'Visit every node in a tree using in-order, pre-order, or post-order walks'],
    ['binary-search-trees', 'Binary Search Trees', ['trees'], 'Keep a tree sorted so searches run in logarithmic time'],
    ['graph-representation', 'Graph Representation', ['graphs'], 'Store graphs as adjacency lists or adjacency matrices'],
    ['choosing', 'Choosing Data Structures', ['stacks', 'queues', 'hash-tables', 'trees'], 'Pick the best data structure for a given problem based on trade-offs'],
    ['array-lists', 'Dynamic Arrays', ['cs.arrays'], 'Use arrays that grow automatically as elements are added'],
  ]),

  // ---- Algorithms (15: 3 preserved + 12 new) ----
  ...topic('cs.algorithms', CS, 'builder', [CF], [
    ['basics', 'Algorithm Basics', ['cs.loops', 'cs.conditionals', 'cs.functions'], 'Understand algorithms as precise step-by-step problem-solving procedures'],
    ['search', 'Searching', ['basics', 'cs.arrays'], 'Find a target value in a collection efficiently'],
    ['sort', 'Sorting', ['basics', 'cs.arrays', 'math.number-comparison'], 'Rearrange elements into a meaningful order'],
    ['linear-search', 'Linear Search', ['search'], 'Check every element one by one until the target is found'],
    ['binary-search', 'Binary Search', ['search', 'cs.arrays'], 'Halve the search space repeatedly in a sorted collection'],
    ['bubble-sort', 'Bubble Sort', ['sort'], 'Swap adjacent elements repeatedly until the list is ordered'],
    ['selection-sort', 'Selection Sort', ['sort'], 'Find the smallest remaining element and move it to the front'],
    ['insertion-sort', 'Insertion Sort', ['sort'], 'Insert each element into its correct position in a growing sorted region'],
    ['merge-sort-intro', 'Merge Sort Introduction', ['sort', 'cs.functions'], 'Divide a list in half, sort each half, then merge them together'],
    ['quick-sort-intro', 'Quick Sort Introduction', ['sort', 'cs.functions'], 'Pick a pivot, partition around it, and sort the partitions'],
    ['algorithm-comparison', 'Comparing Algorithms', ['bubble-sort', 'selection-sort', 'insertion-sort'], 'Measure and compare how algorithms perform on different inputs'],
    ['big-o-intro', 'Big-O Introduction', ['algorithm-comparison'], 'Classify algorithm speed using O(1), O(n), O(n²) notation'],
    ['space-complexity', 'Space Complexity', ['big-o-intro'], 'Measure how much extra memory an algorithm needs'],
    ['counting-sort', 'Counting Sort', ['sort', 'cs.arrays'], 'Sort integers by counting occurrences — no comparisons needed'],
    ['radix-sort', 'Radix Sort', ['counting-sort'], 'Sort numbers digit by digit from least to most significant'],
  ]),

  // ---- Web development (31: 3 preserved + 28 new) ----
  ...topic('cs.web', CS, 'builder', [CF, DW], [
    ['html', 'HTML', ['cs.strings', 'language.reading'], 'Structure web content with headings, paragraphs, and semantic tags'],
    ['css', 'CSS', ['html'], 'Style web pages with colours, fonts, spacing, and layout rules'],
    ['javascript', 'JavaScript', ['html', 'cs.functions'], 'Add interactivity to web pages with a scripting language'],
    ['html-structure', 'HTML Document Structure', ['html'], 'Build a complete HTML page with doctype, head, and body'],
    ['html-text', 'HTML Text Elements', ['html'], 'Mark up headings, paragraphs, emphasis, and blockquotes'],
    ['html-links', 'HTML Links', ['html'], 'Create hyperlinks that connect pages and resources together'],
    ['html-images', 'HTML Images', ['html'], 'Embed images with proper alt text for accessibility'],
    ['html-lists', 'HTML Lists', ['html'], 'Create ordered and unordered lists to organise content'],
    ['html-tables', 'HTML Tables', ['html-lists'], 'Display tabular data with rows, columns, and headers'],
    ['html-forms', 'HTML Forms', ['html-text', 'html-links'], 'Build forms with inputs, buttons, and labels for user data entry'],
    ['html-semantic', 'Semantic HTML', ['html-structure'], 'Use nav, article, section, and aside for meaningful structure'],
    ['html-media', 'HTML Media', ['html-images'], 'Embed audio and video content in web pages'],
    ['css-selectors', 'CSS Selectors', ['css'], 'Target HTML elements by tag, class, ID, and attribute'],
    ['css-box-model', 'CSS Box Model', ['css'], 'Control margin, border, padding, and content dimensions'],
    ['css-colors', 'CSS Colours & Backgrounds', ['css'], 'Apply colours, gradients, and background images to elements'],
    ['css-typography', 'CSS Typography', ['css'], 'Style fonts, sizes, spacing, and text alignment'],
    ['css-layout', 'CSS Layout', ['css-box-model'], 'Position elements using display, float, and positioning properties'],
    ['css-flexbox', 'CSS Flexbox', ['css-layout'], 'Create flexible one-dimensional layouts that adapt to screen size'],
    ['css-grid', 'CSS Grid', ['css-layout'], 'Build two-dimensional page layouts with rows and columns'],
    ['css-responsive', 'Responsive Design', ['css-flexbox', 'css-grid'], 'Make pages look great on phones, tablets, and desktops'],
    ['css-animations', 'CSS Animations', ['css'], 'Animate element properties with transitions and keyframes'],
    ['css-variables', 'CSS Custom Properties', ['css-selectors'], 'Define reusable values with CSS variables for consistent theming'],
    ['js-dom', 'DOM Access', ['javascript'], 'Select and read HTML elements from JavaScript code'],
    ['js-events', 'Event Handling', ['js-dom'], 'Respond to clicks, keypresses, and other user actions'],
    ['js-manipulation', 'DOM Manipulation', ['js-dom'], 'Create, modify, and remove HTML elements dynamically'],
    ['js-forms', 'Form Handling', ['js-events', 'html-forms'], 'Validate and process form data with JavaScript'],
    ['js-fetch', 'Fetch API', ['javascript'], 'Request data from servers using the Fetch API'],
    ['js-json', 'JSON', ['js-fetch'], 'Parse and create JSON data for exchanging information'],
    ['js-storage', 'Local Storage', ['javascript'], 'Save and retrieve data in the browser between page visits'],
    ['js-promises', 'Promises', ['js-fetch'], 'Handle asynchronous operations that finish in the future'],
    ['accessibility', 'Web Accessibility', ['html-semantic', 'html-forms'], 'Build pages that everyone can use, including screen reader users'],
  ]),

  // ---- Databases (12: 2 preserved + 10 new) ----
  ...topic('cs.databases', CS, 'builder', [CF], [
    ['basics', 'Database Basics', ['cs.data-types', 'cs.arrays'], 'Organise persistent data in structured tables with rows and columns'],
    ['sql', 'SQL', ['basics', 'math.discrete.sets'], 'Query and manipulate data with Structured Query Language'],
    ['tables', 'Creating Tables', ['basics'], 'Define table schemas with column names and data types'],
    ['primary-keys', 'Primary Keys', ['tables'], 'Assign a unique identifier to every row in a table'],
    ['foreign-keys', 'Foreign Keys', ['primary-keys'], 'Link rows in one table to rows in another through references'],
    ['insert', 'Inserting Data', ['sql'], 'Add new rows to a table with INSERT statements'],
    ['select', 'Querying Data', ['sql'], 'Retrieve specific rows and columns with SELECT and WHERE'],
    ['update-delete', 'Updating & Deleting', ['select'], 'Modify existing rows with UPDATE and remove them with DELETE'],
    ['where-clause', 'Filtering with WHERE', ['select'], 'Narrow query results with conditions, operators, and wildcards'],
    ['joins', 'Table Joins', ['foreign-keys', 'select'], 'Combine data from multiple tables using JOIN operations'],
    ['aggregation', 'Aggregation', ['select'], 'Summarise data with COUNT, SUM, AVG, MIN, and MAX functions'],
    ['normalization', 'Normalisation', ['foreign-keys', 'joins'], 'Organise tables to reduce redundancy and prevent update anomalies'],
  ]),

  // ---- Version control (8) ----
  ...chain('cs.vcs', CS, 'builder', [CF], [
    ['intro', 'Version Control Intro', 'Understand why tracking changes to code over time is essential'],
    ['repos', 'Repositories', 'Create a repository to store a project and its full history'],
    ['commits', 'Commits', 'Save snapshots of changes with descriptive commit messages'],
    ['branches', 'Branches', 'Create parallel versions of code to work on features safely'],
    ['merging', 'Merging', 'Combine changes from one branch into another'],
    ['conflicts', 'Merge Conflicts', 'Resolve competing changes when two branches modify the same code'],
    ['remote', 'Remote Repositories', 'Push and pull code to a shared server for collaboration'],
    ['collaboration', 'Collaboration Workflows', 'Use pull requests and code review to work as a team'],
  ], ['cs.functions']),

  // ---- Testing basics (10) ----
  ...topic('cs.testing', CS, 'builder', [CF], [
    ['intro', 'Testing Introduction', ['cs.functions'], 'Understand why testing code catches bugs before users do'],
    ['unit-tests', 'Unit Tests', ['intro'], 'Write tests that check individual functions in isolation'],
    ['test-cases', 'Test Case Design', ['unit-tests'], 'Plan tests for normal, boundary, and error conditions'],
    ['assertions', 'Assertions', ['unit-tests'], 'Use assert statements to verify expected outcomes'],
    ['edge-cases', 'Edge Cases', ['test-cases'], 'Test unusual inputs like empty strings, zero, and huge numbers'],
    ['debugging-tools', 'Debugging Tools', ['cs.debugging'], 'Use integrated debugger tools to step through code'],
    ['breakpoints', 'Breakpoints', ['debugging-tools'], 'Pause execution at specific lines to inspect program state'],
    ['logging', 'Logging', ['cs.debugging'], 'Add log messages to trace program execution and diagnose issues'],
    ['code-review-intro', 'Code Review Introduction', ['intro'], 'Read and critique others code to find bugs and improve quality'],
    ['documentation-intro', 'Documentation Basics', ['cs.functions'], 'Write clear comments and documentation so others can understand your code'],
  ]),

  // ---- Command line (12) ----
  ...topic('cs.cli', CS, 'builder', [CF], [
    ['intro', 'Command Line Introduction', ['cs.software.operating-systems'], 'Navigate a computer using text commands instead of a mouse'],
    ['navigation', 'Directory Navigation', ['intro'], 'Move between folders with cd, list contents with ls, and find your path with pwd'],
    ['files', 'File Operations', ['navigation'], 'Create, copy, move, rename, and delete files from the command line'],
    ['directories', 'Directory Operations', ['navigation'], 'Create, remove, and organise folders from the terminal'],
    ['permissions', 'File Permissions', ['files'], 'Read and set who can read, write, and execute files'],
    ['pipes', 'Pipes', ['files'], 'Chain commands together so the output of one feeds into the next'],
    ['redirection', 'Redirection', ['pipes'], 'Send command output to files and read input from files'],
    ['environment', 'Environment Variables', ['intro'], 'Set and read system-wide variables that configure program behaviour'],
    ['scripts', 'Shell Scripts', ['pipes', 'cs.functions'], 'Automate repetitive tasks by writing sequences of commands in a script'],
    ['package-managers', 'Package Managers', ['intro'], 'Install, update, and remove software libraries with a package manager'],
    ['ssh-basics', 'SSH Basics', ['intro', 'cs.internet.networks'], 'Connect securely to remote computers over the network'],
    ['text-processing', 'Text Processing', ['pipes'], 'Filter, search, and transform text with grep, sed, and awk'],
  ]),

  // ---- Advanced debugging (8) ----
  ...topic('cs.debug', CS, 'builder', [CF], [
    ['systematic', 'Systematic Debugging', ['cs.debugging'], 'Follow a methodical process to isolate and fix bugs'],
    ['print-debug', 'Print Debugging', ['systematic'], 'Insert print statements to trace variable values during execution'],
    ['rubber-duck', 'Rubber Duck Debugging', ['systematic'], 'Explain code line-by-line aloud to uncover hidden logic errors'],
    ['binary-search-debug', 'Binary Search Debugging', ['systematic'], 'Narrow down the buggy region by testing the middle of the code'],
    ['stack-trace', 'Reading Stack Traces', ['cs.functions'], 'Follow the chain of function calls to find where an error originated'],
    ['error-messages', 'Error Message Interpretation', ['cs.debugging'], 'Decode compiler and runtime error messages to understand what went wrong'],
    ['test-driven', 'Test-Driven Debugging', ['cs.testing.unit-tests'], 'Write a failing test that reproduces a bug, then fix the code until it passes'],
    ['code-walkthrough', 'Code Walkthrough', ['systematic'], 'Trace through code mentally or on paper to predict its behaviour step by step'],
  ]),

  // ---- I/O and file handling (8) ----
  ...topic('cs.io', CS, 'builder', [CF], [
    ['console', 'Console I/O', ['cs.functions'], 'Read from standard input and write to standard output'],
    ['file-read', 'Reading Files', ['console'], 'Open and read data from text files on disk'],
    ['file-write', 'Writing Files', ['file-read'], 'Create and write data to text files'],
    ['csv', 'CSV Files', ['file-read', 'cs.strings'], 'Parse and generate comma-separated value files'],
    ['json-files', 'JSON Files', ['file-read', 'cs.strings'], 'Read and write structured data in JSON format'],
    ['path-handling', 'Path Handling', ['file-read'], 'Construct and manipulate file paths across operating systems'],
    ['binary-files', 'Binary Files', ['file-read', 'cs.binary.byte'], 'Read and write raw binary data to files'],
    ['streaming-io', 'Streaming I/O', ['file-read'], 'Process large files line by line without loading everything into memory'],
  ]),

  // ---- Regular expressions (6) ----
  ...chain('cs.regex', CS, 'builder', [CF], [
    ['intro', 'Regex Introduction', 'Match text patterns using regular expression syntax'],
    ['character-classes', 'Character Classes', 'Match sets of characters with brackets and shorthand classes'],
    ['quantifiers', 'Quantifiers', 'Specify how many times a pattern should repeat'],
    ['anchors', 'Anchors & Boundaries', 'Pin patterns to the start, end, or word boundaries of text'],
    ['groups', 'Capture Groups', 'Extract matched sub-patterns and use backreferences'],
    ['practical', 'Practical Regex', 'Validate emails, phone numbers, and other real-world formats'],
  ], ['cs.strings']),

  // ---- Functional programming intro (8) ----
  ...topic('cs.fp-intro', CS, 'builder', [CF], [
    ['callbacks', 'Callbacks', ['cs.functions'], 'Pass a function as an argument to be called later when an event occurs'],
    ['higher-order-intro', 'Higher-Order Functions Intro', ['callbacks'], 'Write functions that accept or return other functions'],
    ['map', 'Map', ['higher-order-intro', 'cs.arrays'], 'Transform every element in an array by applying a function'],
    ['filter', 'Filter', ['higher-order-intro', 'cs.arrays'], 'Select array elements that satisfy a given condition'],
    ['reduce', 'Reduce', ['map', 'filter'], 'Combine all elements into a single value with an accumulator function'],
    ['chaining', 'Method Chaining', ['map', 'filter'], 'Chain transformation steps together for expressive data pipelines'],
    ['anonymous-functions', 'Anonymous Functions', ['callbacks'], 'Define short throwaway functions inline without a name'],
    ['spread-destructure', 'Spread and Destructuring', ['cs.arrays', 'cs.prog.array-index'], 'Unpack arrays and objects into individual variables concisely'],
  ]),

  // ---- Recursion intro (5) ----
  ...topic('cs.recursion-intro', CS, 'builder', [CF], [
    ['concept', 'Recursion Concept', ['cs.functions'], 'Understand how a function can call itself to solve smaller sub-problems'],
    ['base-case', 'Base Cases', ['concept'], 'Define the stopping condition that prevents infinite recursion'],
    ['factorial', 'Factorial Recursion', ['base-case'], 'Calculate n! by multiplying n by the factorial of n-1'],
    ['fibonacci', 'Fibonacci Recursion', ['base-case'], 'Compute Fibonacci numbers by summing the two preceding values'],
    ['tree-recursion', 'Tree Recursion', ['fibonacci', 'cs.data-structures.trees'], 'Traverse tree structures naturally using recursive function calls'],
  ]),

  // ---- Event-driven programming (6) ----
  ...topic('cs.event-driven', CS, 'builder', [CF], [
    ['events-concept', 'Events Concept', ['cs.functions'], 'Understand programs driven by user actions and system signals'],
    ['event-handlers', 'Event Handlers', ['events-concept'], 'Write functions that run in response to specific events'],
    ['event-loop-intro', 'Event Loop Intro', ['event-handlers'], 'Understand how a single-threaded loop processes events in order'],
    ['timers', 'Timers', ['event-handlers'], 'Schedule code to run after a delay or at regular intervals'],
    ['custom-events', 'Custom Events', ['event-handlers'], 'Define and dispatch your own event types for decoupled communication'],
    ['event-delegation', 'Event Delegation', ['event-handlers', 'cs.web.js-dom'], 'Handle events efficiently by listening on a parent instead of every child'],
  ]),

  // ---- Additional data processing (6) ----
  ...topic('cs.data-processing', CS, 'builder', [CF], [
    ['parsing', 'Data Parsing', ['cs.strings', 'cs.io.file-read'], 'Extract structured information from raw text data'],
    ['validation', 'Data Validation', ['parsing'], 'Check that data meets expected formats and constraints before use'],
    ['transformation', 'Data Transformation', ['parsing', 'cs.arrays'], 'Convert data from one format or shape into another'],
    ['serialization', 'Serialisation', ['cs.io.json-files'], 'Convert objects to storable strings and back again'],
    ['date-time', 'Date and Time', ['cs.data-types'], 'Work with dates, times, time zones, and durations correctly'],
    ['unicode', 'Unicode', ['cs.strings', 'cs.data-rep.text-encoding'], 'Handle international text with multi-byte character encodings'],
  ]),
];

// ===========================================================================
// COMPUTER SCIENCE — INNOVATOR  (~250 skills)
// Advanced algorithms, design patterns, networking, OS, security, software eng
// ===========================================================================

const csInnovator: SkillNode[] = [

  // ---- Preserved skills ----
  skill('cs.algorithms.complexity', 'Algorithm Complexity', CS, 'innovator',
    ['cs.algorithms.basics', 'math.algebra.logarithms'],
    'Analyse algorithm efficiency with Big-O, Big-Theta, and Big-Omega notation', [CF]),
  skill('cs.algorithms.recursion', 'Recursion', CS, 'innovator',
    ['cs.functions', 'math.algebra.sequences'],
    'Solve problems by having functions call themselves on smaller sub-problems', [CF]),
  skill('cs.algorithms.dynamic-programming', 'Dynamic Programming', CS, 'innovator',
    ['cs.algorithms.recursion', 'cs.arrays'],
    'Solve overlapping sub-problems efficiently by caching intermediate results', [CF]),
  skill('cs.algorithms.graph-algorithms', 'Graph Algorithms', CS, 'innovator',
    ['cs.data-structures.graphs', 'cs.algorithms.complexity'],
    'Traverse, search, and optimise paths through graph structures', [CF]),
  skill('cs.networking.basics', 'Networking Basics', CS, 'innovator',
    ['cs.data-types'],
    'Understand how computers communicate over networks using protocols', [CF, DW]),
  skill('cs.security.basics', 'Security Basics', CS, 'innovator',
    ['cs.networking.basics', 'math.discrete.number-theory'],
    'Protect systems with encryption, authentication, and access control', [CF, DW]),

  // ---- Advanced algorithms (24) ----
  ...topic('cs.adv-algorithms', CS, 'innovator', [CF], [
    ['divide-conquer', 'Divide and Conquer', ['cs.algorithms.recursion'], 'Split problems in half, solve each, and combine the results'],
    ['master-theorem', 'Master Theorem', ['divide-conquer', 'cs.algorithms.complexity'], 'Calculate the complexity of divide-and-conquer recurrences'],
    ['greedy', 'Greedy Algorithms', ['cs.algorithms.basics'], 'Make the locally optimal choice at each step hoping for a global optimum'],
    ['greedy-proofs', 'Greedy Correctness', ['greedy'], 'Prove that a greedy strategy produces an optimal solution'],
    ['dp-tabulation', 'DP Tabulation', ['cs.algorithms.dynamic-programming'], 'Build solutions bottom-up using a table of sub-problem results'],
    ['dp-memoization', 'DP Memoisation', ['cs.algorithms.dynamic-programming'], 'Cache recursive call results to avoid redundant computation'],
    ['dp-patterns', 'DP Patterns', ['dp-tabulation', 'dp-memoization'], 'Recognise classic DP patterns: knapsack, LCS, edit distance'],
    ['backtracking', 'Backtracking', ['cs.algorithms.recursion'], 'Explore all possibilities and undo choices that lead to dead ends'],
    ['branch-bound', 'Branch and Bound', ['backtracking', 'greedy'], 'Prune the search space by bounding potential solutions'],
    ['bfs', 'Breadth-First Search', ['cs.algorithms.graph-algorithms'], 'Explore graph nodes level by level to find shortest unweighted paths'],
    ['dfs', 'Depth-First Search', ['cs.algorithms.graph-algorithms'], 'Explore graph branches as deep as possible before backtracking'],
    ['dijkstra', 'Dijkstra\'s Algorithm', ['bfs', 'cs.data-structures.priority-queues'], 'Find the shortest weighted path from one node to all others'],
    ['bellman-ford', 'Bellman-Ford Algorithm', ['dijkstra'], 'Handle shortest paths even when edge weights are negative'],
    ['minimum-spanning', 'Minimum Spanning Trees', ['cs.algorithms.graph-algorithms', 'greedy'], 'Connect all nodes with the minimum total edge weight'],
    ['topological-sort', 'Topological Sort', ['dfs'], 'Order directed acyclic graph nodes so dependencies come first'],
    ['strongly-connected', 'Strongly Connected Components', ['dfs'], 'Find groups of nodes where every node can reach every other'],
    ['string-matching', 'String Matching', ['cs.strings', 'cs.algorithms.basics'], 'Find patterns in text efficiently using KMP or Boyer-Moore'],
    ['amortized', 'Amortised Analysis', ['cs.algorithms.complexity'], 'Average the cost of operations over a sequence for a tighter bound'],
    ['randomized', 'Randomised Algorithms', ['cs.algorithms.basics', 'math.probability.basic'], 'Use random choices to simplify algorithms or improve expected performance'],
    ['np-intro', 'NP-Completeness Introduction', ['cs.algorithms.complexity'], 'Understand problems whose solutions can be verified but not quickly found'],
    ['reductions', 'Problem Reductions', ['np-intro'], 'Prove a problem is hard by transforming a known hard problem into it'],
    ['approximation', 'Approximation Algorithms', ['np-intro', 'greedy'], 'Find near-optimal solutions when exact solutions are too slow'],
    ['heuristics', 'Heuristic Search', ['greedy', 'cs.algorithms.graph-algorithms'], 'Guide search with estimates to find good solutions faster'],
    ['algorithm-design-strategies', 'Algorithm Design Strategies', ['divide-conquer', 'greedy', 'cs.algorithms.dynamic-programming'], 'Choose the right paradigm — divide-and-conquer, greedy, or DP — for a problem'],
  ]),

  // ---- Advanced data structures (20) ----
  ...topic('cs.adv-structures', CS, 'innovator', [CF], [
    ['heaps', 'Heaps', ['cs.data-structures.trees'], 'Maintain a complete binary tree where the root is always the extreme value'],
    ['heap-operations', 'Heap Operations', ['heaps'], 'Insert, extract-min/max, and heapify in logarithmic time'],
    ['tries', 'Tries', ['cs.data-structures.trees', 'cs.strings'], 'Store strings character by character for fast prefix searches'],
    ['balanced-trees', 'Balanced Trees', ['cs.data-structures.binary-search-trees'], 'Keep trees balanced so operations stay logarithmic'],
    ['avl-trees', 'AVL Trees', ['balanced-trees'], 'Balance a BST with rotation after every insert or delete'],
    ['red-black-trees', 'Red-Black Trees', ['balanced-trees'], 'Balance a BST using colour properties with fewer rotations than AVL'],
    ['b-trees', 'B-Trees', ['balanced-trees'], 'Store data in wide, shallow trees optimised for disk access'],
    ['segment-trees', 'Segment Trees', ['cs.data-structures.trees', 'cs.algorithms.recursion'], 'Answer range queries and updates on arrays in logarithmic time'],
    ['fenwick-trees', 'Fenwick Trees', ['segment-trees'], 'Compute prefix sums and point updates with compact bit manipulation'],
    ['union-find', 'Union-Find', ['cs.data-structures.trees'], 'Track connected components with near-constant time union and find'],
    ['skip-lists', 'Skip Lists', ['cs.data-structures.linked-lists', 'math.probability.basic'], 'Build a probabilistic layered list that supports fast search'],
    ['bloom-filters', 'Bloom Filters', ['cs.data-structures.hash-tables', 'math.probability.basic'], 'Test set membership with a space-efficient probabilistic structure'],
    ['lru-cache', 'LRU Cache', ['cs.data-structures.hash-tables', 'cs.data-structures.linked-lists'], 'Evict the least recently used item when the cache is full'],
    ['graph-advanced', 'Advanced Graph Representations', ['cs.data-structures.graph-representation'], 'Use adjacency matrices, adjacency lists, and edge lists by context'],
    ['immutable-structures', 'Immutable Data Structures', ['cs.data-structures.trees'], 'Share structure between versions of data that never change in place'],
    ['spatial-structures', 'Spatial Data Structures', ['cs.data-structures.trees'], 'Organise 2D/3D data for efficient nearest-neighbour and range queries'],
    ['kd-trees', 'k-d Trees', ['spatial-structures'], 'Partition space by alternating dimensions for multi-dimensional search'],
    ['quad-trees', 'Quad Trees', ['spatial-structures'], 'Subdivide two-dimensional space into four quadrants recursively'],
    ['hash-advanced', 'Advanced Hashing', ['cs.data-structures.hash-tables'], 'Handle collisions with chaining, open addressing, and cuckoo hashing'],
    ['persistent-structures', 'Persistent Data Structures', ['immutable-structures'], 'Keep all previous versions of a data structure accessible efficiently'],
  ]),

  // ---- OOP design patterns (20) ----
  ...topic('cs.patterns', CS, 'innovator', [CF], [
    ['design-intro', 'Design Patterns Introduction', ['cs.oop.polymorphism', 'cs.oop.composition'], 'Recognise recurring solutions to common object-oriented design problems'],
    ['factory', 'Factory Pattern', ['design-intro'], 'Delegate object creation to a factory method for flexible instantiation'],
    ['abstract-factory', 'Abstract Factory', ['factory'], 'Create families of related objects without specifying their concrete classes'],
    ['builder-pattern', 'Builder Pattern', ['design-intro'], 'Construct complex objects step by step with a fluent interface'],
    ['singleton', 'Singleton Pattern', ['design-intro'], 'Ensure a class has exactly one instance accessible globally'],
    ['observer', 'Observer Pattern', ['design-intro'], 'Notify multiple listeners automatically when a subject changes state'],
    ['strategy', 'Strategy Pattern', ['design-intro'], 'Swap algorithms at runtime by encapsulating them behind an interface'],
    ['command', 'Command Pattern', ['design-intro'], 'Encapsulate a request as an object for queuing, logging, or undo'],
    ['decorator', 'Decorator Pattern', ['design-intro'], 'Wrap objects to add behaviour dynamically without modifying the class'],
    ['adapter', 'Adapter Pattern', ['design-intro'], 'Convert one interface into another that clients expect'],
    ['facade', 'Facade Pattern', ['design-intro'], 'Provide a simple interface to a complex subsystem'],
    ['composite', 'Composite Pattern', ['design-intro', 'cs.data-structures.trees'], 'Treat individual objects and groups uniformly in a tree structure'],
    ['iterator-pattern', 'Iterator Pattern', ['design-intro', 'cs.data-structures.iterators'], 'Traverse a collection without exposing its internal representation'],
    ['template-method', 'Template Method', ['design-intro'], 'Define the skeleton of an algorithm and let subclasses fill in steps'],
    ['state-pattern', 'State Pattern', ['design-intro'], 'Change an object behaviour when its internal state changes'],
    ['proxy', 'Proxy Pattern', ['design-intro'], 'Control access to an object through a placeholder or surrogate'],
    ['mvc', 'Model-View-Controller', ['observer', 'strategy'], 'Separate data, presentation, and input handling into three components'],
    ['mvvm', 'Model-View-ViewModel', ['mvc'], 'Bind a view to a view-model for declarative UI updates'],
    ['dependency-injection', 'Dependency Injection', ['factory'], 'Supply dependencies from outside so classes remain loosely coupled'],
    ['repository-pattern', 'Repository Pattern', ['design-intro', 'cs.databases.sql'], 'Abstract data access behind a clean collection-like interface'],
  ]),

  // ---- Software engineering (25) ----
  ...topic('cs.software-eng', CS, 'innovator', [CF], [
    ['solid-intro', 'SOLID Principles Introduction', ['cs.oop.polymorphism'], 'Apply five design principles for maintainable object-oriented code'],
    ['srp', 'Single Responsibility', ['solid-intro'], 'Give every class exactly one reason to change'],
    ['ocp', 'Open-Closed Principle', ['solid-intro'], 'Allow extension through new code without modifying existing code'],
    ['lsp', 'Liskov Substitution', ['solid-intro'], 'Ensure subclasses can replace their parents without breaking behaviour'],
    ['isp', 'Interface Segregation', ['solid-intro'], 'Prefer many small interfaces over one bloated interface'],
    ['dip', 'Dependency Inversion', ['solid-intro'], 'Depend on abstractions rather than concrete implementations'],
    ['dry', 'DRY Principle', ['cs.functions'], 'Eliminate duplicate code by extracting shared logic'],
    ['kiss', 'KISS Principle', ['cs.functions'], 'Keep solutions as simple as possible without unnecessary complexity'],
    ['yagni', 'YAGNI Principle', ['cs.functions'], 'Build only what is needed now, not what might be needed later'],
    ['clean-code', 'Clean Code', ['dry', 'kiss'], 'Write code that is easy to read, understand, and maintain'],
    ['refactoring', 'Refactoring', ['clean-code', 'cs.testing.unit-tests'], 'Improve code structure without changing its external behaviour'],
    ['code-smells', 'Code Smells', ['refactoring'], 'Recognise patterns that suggest code could be improved'],
    ['tdd', 'Test-Driven Development', ['cs.testing.unit-tests'], 'Write tests first, then write just enough code to pass them'],
    ['integration-testing', 'Integration Testing', ['cs.testing.unit-tests'], 'Test how multiple components work together as a system'],
    ['mocking', 'Mocking & Stubs', ['cs.testing.unit-tests'], 'Replace dependencies with fake objects to isolate unit tests'],
    ['code-coverage', 'Code Coverage', ['cs.testing.unit-tests'], 'Measure how much of the codebase is exercised by tests'],
    ['agile-intro', 'Agile Introduction', ['cs.vcs.collaboration'], 'Deliver software in short iterations with continuous feedback'],
    ['scrum-basics', 'Scrum Basics', ['agile-intro'], 'Plan work in sprints with standups, reviews, and retrospectives'],
    ['kanban', 'Kanban', ['agile-intro'], 'Visualise work flow and limit work-in-progress for steady delivery'],
    ['code-review', 'Code Review', ['cs.vcs.collaboration'], 'Review pull requests to catch bugs and share knowledge across the team'],
    ['documentation', 'Technical Documentation', ['cs.testing.documentation-intro'], 'Write API docs, architecture guides, and runbooks for long-term maintainability'],
    ['api-design', 'API Design', ['cs.functions', 'cs.oop.interfaces'], 'Design clean, consistent, and well-documented programming interfaces'],
    ['semantic-versioning', 'Semantic Versioning', ['cs.vcs.collaboration'], 'Version releases with MAJOR.MINOR.PATCH to signal compatibility'],
    ['technical-debt', 'Technical Debt', ['refactoring'], 'Identify and strategically pay down shortcuts that slow future development'],
    ['pair-programming', 'Pair Programming', ['code-review'], 'Write code collaboratively with a partner for faster problem-solving'],
  ]),

  // ---- Web advanced (25) ----
  ...topic('cs.web-adv', CS, 'innovator', [CF, DW], [
    ['spa', 'Single-Page Applications', ['cs.web.js-dom', 'cs.web.js-events'], 'Build apps that update dynamically without full page reloads'],
    ['component-arch', 'Component Architecture', ['spa'], 'Compose UIs from reusable, self-contained components'],
    ['state-management', 'State Management', ['component-arch'], 'Manage shared application state predictably across components'],
    ['routing', 'Client-Side Routing', ['spa'], 'Navigate between views without reloading the page'],
    ['rest-api', 'REST APIs', ['cs.web.js-fetch', 'cs.web.js-json'], 'Design and consume RESTful web services over HTTP'],
    ['graphql-intro', 'GraphQL Introduction', ['rest-api'], 'Query exactly the data you need with a typed query language'],
    ['auth-basics', 'Authentication Basics', ['rest-api', 'cs.security.basics'], 'Implement login flows with sessions, tokens, or OAuth'],
    ['jwt', 'JSON Web Tokens', ['auth-basics'], 'Encode claims in signed tokens for stateless authentication'],
    ['websockets', 'WebSockets', ['rest-api'], 'Open persistent two-way connections for real-time communication'],
    ['ssr', 'Server-Side Rendering', ['spa'], 'Render pages on the server for faster initial loads and SEO'],
    ['static-generation', 'Static Site Generation', ['ssr'], 'Pre-build pages at compile time for maximum speed and security'],
    ['progressive-web', 'Progressive Web Apps', ['spa', 'cs.web.css-responsive'], 'Create web apps that feel native with offline support and push notifications'],
    ['service-workers', 'Service Workers', ['progressive-web'], 'Intercept network requests and serve cached content offline'],
    ['web-security', 'Web Security', ['auth-basics', 'cs.security.basics'], 'Prevent XSS, CSRF, injection, and other common web vulnerabilities'],
    ['performance', 'Web Performance', ['spa'], 'Optimise load times with lazy loading, caching, and code splitting'],
    ['testing-web', 'Web Testing', ['spa', 'cs.testing.unit-tests'], 'Write unit, integration, and end-to-end tests for web applications'],
    ['build-tools', 'Build Tools', ['spa'], 'Bundle, minify, and transpile code with modern build pipelines'],
    ['css-preprocessors', 'CSS Preprocessors', ['cs.web.css-variables'], 'Use Sass or Less for variables, nesting, and mixins in stylesheets'],
    ['css-frameworks', 'CSS Frameworks', ['cs.web.css-responsive'], 'Accelerate layout with utility or component CSS frameworks'],
    ['api-versioning', 'API Versioning', ['rest-api'], 'Evolve APIs without breaking existing clients'],
    ['headless-cms', 'Headless CMS', ['rest-api', 'static-generation'], 'Manage content separately from its front-end presentation'],
    ['web-workers', 'Web Workers', ['cs.web.javascript'], 'Run heavy computation off the main thread to keep the UI responsive'],
    ['accessibility-adv', 'Advanced Accessibility', ['cs.web.accessibility'], 'Implement ARIA roles, keyboard navigation, and screen reader testing'],
    ['internationalisation', 'Internationalisation', ['cs.web.javascript'], 'Support multiple languages, formats, and right-to-left text'],
    ['deployment', 'Web Deployment', ['build-tools'], 'Deploy web applications to servers or static hosting platforms'],
  ]),

  // ---- Database advanced (15) ----
  ...topic('cs.db-adv', CS, 'innovator', [CF], [
    ['indexes', 'Indexes', ['cs.databases.sql'], 'Speed up queries by creating indexes on frequently searched columns'],
    ['query-planning', 'Query Planning', ['indexes'], 'Read and optimise execution plans for efficient queries'],
    ['transactions', 'Transactions', ['cs.databases.sql'], 'Group operations into atomic units that succeed or fail together'],
    ['acid', 'ACID Properties', ['transactions'], 'Ensure atomicity, consistency, isolation, and durability of data'],
    ['stored-procedures', 'Stored Procedures', ['cs.databases.sql'], 'Write reusable server-side database logic for complex operations'],
    ['views', 'Database Views', ['cs.databases.sql'], 'Create virtual tables from saved queries for simpler data access'],
    ['triggers', 'Triggers', ['stored-procedures'], 'Run code automatically when rows are inserted, updated, or deleted'],
    ['nosql-intro', 'NoSQL Introduction', ['cs.databases.basics'], 'Explore document, key-value, column, and graph database models'],
    ['document-stores', 'Document Stores', ['nosql-intro'], 'Store flexible JSON documents without a rigid schema'],
    ['key-value-stores', 'Key-Value Stores', ['nosql-intro'], 'Map keys to values for blazing-fast simple lookups'],
    ['graph-databases', 'Graph Databases', ['nosql-intro', 'cs.data-structures.graphs'], 'Store and query relationships as first-class citizens'],
    ['data-modeling', 'Data Modelling', ['cs.databases.normalization'], 'Design schemas that balance normalisation, performance, and usability'],
    ['migration', 'Schema Migration', ['data-modeling'], 'Evolve database schemas safely as requirements change'],
    ['replication-intro', 'Replication Introduction', ['transactions'], 'Copy data across servers for availability and read performance'],
    ['sharding-intro', 'Sharding Introduction', ['replication-intro'], 'Split data across multiple servers to handle scale'],
  ]),

  // ---- Networking (25) ----
  ...topic('cs.networking', CS, 'innovator', [CF, DW], [
    ['osi-model', 'OSI Model', ['cs.networking.basics'], 'Describe the seven layers that standardise network communication'],
    ['tcp-ip', 'TCP/IP', ['osi-model'], 'Understand the four-layer protocol suite that powers the internet'],
    ['tcp', 'TCP Protocol', ['tcp-ip'], 'Deliver reliable, ordered, and error-checked data streams'],
    ['udp', 'UDP Protocol', ['tcp-ip'], 'Send datagrams with minimal overhead when speed matters more than reliability'],
    ['ip-addressing', 'IP Addressing', ['tcp-ip'], 'Assign and read IPv4 and IPv6 addresses for devices on a network'],
    ['subnetting', 'Subnetting', ['ip-addressing'], 'Divide networks into smaller subnets using masks'],
    ['dns', 'DNS', ['ip-addressing'], 'Translate human-readable domain names into IP addresses'],
    ['http', 'HTTP Protocol', ['tcp'], 'Exchange requests and responses on the web with HTTP methods and status codes'],
    ['https-tls', 'HTTPS and TLS', ['http', 'cs.security.basics'], 'Encrypt web traffic with TLS to protect data in transit'],
    ['http2-http3', 'HTTP/2 and HTTP/3', ['http'], 'Use multiplexing and QUIC for faster, more efficient web communication'],
    ['sockets', 'Sockets', ['tcp'], 'Open low-level network connections for custom protocol communication'],
    ['client-server', 'Client-Server Model', ['sockets'], 'Separate concerns into clients that request and servers that respond'],
    ['peer-to-peer', 'Peer-to-Peer', ['client-server'], 'Build decentralised networks where every node is both client and server'],
    ['firewalls', 'Firewalls', ['ip-addressing', 'cs.security.basics'], 'Filter network traffic to block unauthorised access'],
    ['nat', 'NAT', ['ip-addressing'], 'Map private IP addresses to a shared public address for internet access'],
    ['vpn', 'Virtual Private Networks', ['https-tls'], 'Create encrypted tunnels across public networks for secure access'],
    ['load-balancing', 'Load Balancing', ['client-server'], 'Distribute incoming requests across multiple servers for reliability'],
    ['cdn', 'Content Delivery Networks', ['dns', 'http'], 'Cache and serve content from geographically close servers'],
    ['dhcp', 'DHCP', ['ip-addressing'], 'Assign IP addresses automatically to devices joining a network'],
    ['arp', 'ARP', ['ip-addressing'], 'Resolve IP addresses to physical MAC addresses on a local network'],
    ['routing-protocols', 'Routing Protocols', ['subnetting'], 'Discover and select paths for data through interconnected networks'],
    ['wireless-networking', 'Wireless Networking', ['cs.networking.basics'], 'Connect devices over radio frequencies with Wi-Fi standards'],
    ['network-troubleshoot', 'Network Troubleshooting', ['tcp-ip'], 'Diagnose connectivity issues with ping, traceroute, and netstat'],
    ['network-security', 'Network Security Fundamentals', ['firewalls', 'cs.security.basics'], 'Protect networks from intrusion, sniffing, and spoofing attacks'],
    ['protocols-comparison', 'Protocol Comparison', ['tcp', 'udp', 'http'], 'Choose the right protocol for a given application scenario'],
  ]),

  // ---- Operating systems (25) ----
  ...topic('cs.os', CS, 'innovator', [CF, DW], [
    ['intro', 'OS Introduction', ['cs.software.operating-systems'], 'Understand the operating system as a resource manager and abstraction layer'],
    ['processes', 'Processes', ['intro'], 'Run independent programs with their own memory and execution context'],
    ['threads', 'Threads', ['processes'], 'Share memory within a process for lightweight parallel execution'],
    ['scheduling', 'Process Scheduling', ['processes'], 'Decide which process runs next using FCFS, round-robin, or priority queues'],
    ['context-switching', 'Context Switching', ['scheduling'], 'Save and restore process state when switching between tasks'],
    ['concurrency', 'Concurrency', ['threads'], 'Run multiple tasks that overlap in time safely'],
    ['synchronisation', 'Synchronisation', ['concurrency'], 'Coordinate threads with locks, semaphores, and monitors'],
    ['deadlocks', 'Deadlocks', ['synchronisation'], 'Detect, prevent, and recover when threads wait on each other forever'],
    ['memory-basics', 'Memory Management Basics', ['intro'], 'Allocate and free memory for running programs efficiently'],
    ['virtual-memory', 'Virtual Memory', ['memory-basics'], 'Give each process its own address space backed by RAM and disk'],
    ['paging', 'Paging', ['virtual-memory'], 'Divide memory into fixed-size pages for flexible allocation'],
    ['segmentation', 'Segmentation', ['virtual-memory'], 'Divide memory into logical segments like code, data, and stack'],
    ['page-replacement', 'Page Replacement', ['paging'], 'Choose which page to evict when memory is full using LRU or FIFO'],
    ['file-systems', 'File Systems', ['intro'], 'Organise data on disk with files, directories, and metadata'],
    ['file-allocation', 'File Allocation', ['file-systems'], 'Map files to disk blocks using contiguous, linked, or indexed allocation'],
    ['permissions-os', 'OS Permissions', ['file-systems'], 'Control file access with user, group, and other permission bits'],
    ['io-management', 'I/O Management', ['intro'], 'Coordinate input/output devices with drivers and interrupt handling'],
    ['interrupts', 'Interrupts', ['io-management'], 'Respond to hardware and software signals that preempt normal execution'],
    ['system-calls', 'System Calls', ['intro'], 'Request OS services from user programs through a protected interface'],
    ['shell', 'The Shell', ['system-calls'], 'Interact with the OS through a command interpreter'],
    ['boot-process', 'Boot Process', ['intro'], 'Follow the steps from power-on to a running operating system'],
    ['virtualisation-intro', 'Virtualisation Introduction', ['intro'], 'Run multiple virtual machines on a single physical host'],
    ['containers-intro', 'Containers Introduction', ['virtualisation-intro'], 'Package applications with their dependencies in lightweight containers'],
    ['ipc', 'Inter-Process Communication', ['processes'], 'Exchange data between processes using pipes, shared memory, and sockets'],
    ['real-time-os', 'Real-Time Operating Systems', ['scheduling'], 'Meet strict timing deadlines for embedded and control applications'],
  ]),

  // ---- Cybersecurity (25) ----
  ...topic('cs.security', CS, 'innovator', [CF, DW], [
    ['cia-triad', 'CIA Triad', ['cs.security.basics'], 'Protect confidentiality, integrity, and availability of information'],
    ['symmetric-encryption', 'Symmetric Encryption', ['cs.security.basics'], 'Encrypt and decrypt with a single shared secret key'],
    ['asymmetric-encryption', 'Asymmetric Encryption', ['symmetric-encryption'], 'Use public/private key pairs for secure communication'],
    ['hashing', 'Cryptographic Hashing', ['cs.security.basics'], 'Produce fixed-size fingerprints that detect any change in data'],
    ['digital-signatures', 'Digital Signatures', ['asymmetric-encryption', 'hashing'], 'Verify the author and integrity of a message cryptographically'],
    ['certificates', 'Digital Certificates', ['digital-signatures'], 'Establish trust with signed certificates from certificate authorities'],
    ['password-security', 'Password Security', ['hashing'], 'Store passwords safely with salting and key-stretching algorithms'],
    ['auth-mechanisms', 'Authentication Mechanisms', ['password-security'], 'Compare passwords, tokens, biometrics, and multi-factor authentication'],
    ['access-control', 'Access Control', ['auth-mechanisms'], 'Restrict resources with roles, permissions, and access control lists'],
    ['sql-injection', 'SQL Injection', ['cs.databases.sql'], 'Understand and prevent attacks that inject malicious SQL into queries'],
    ['xss', 'Cross-Site Scripting', ['cs.web.javascript'], 'Prevent attackers from injecting scripts into web pages'],
    ['csrf', 'Cross-Site Request Forgery', ['cs.web.js-forms'], 'Stop attackers from tricking users into performing unwanted actions'],
    ['dos', 'Denial of Service', ['cs.networking.basics'], 'Recognise and mitigate attacks that overwhelm a system with traffic'],
    ['vulnerability-scanning', 'Vulnerability Scanning', ['cia-triad'], 'Systematically test systems for known security weaknesses'],
    ['penetration-testing-intro', 'Penetration Testing Introduction', ['vulnerability-scanning'], 'Simulate attacks to discover vulnerabilities before adversaries do'],
    ['social-engineering', 'Social Engineering', ['cia-triad'], 'Recognise manipulation tactics used to bypass technical defences'],
    ['network-security-adv', 'Network Security Advanced', ['cs.networking.network-security'], 'Deploy IDS, IPS, and SIEM systems to monitor and defend networks'],
    ['secure-coding', 'Secure Coding Practices', ['sql-injection', 'xss'], 'Write code that resists common attack patterns by design'],
    ['incident-response', 'Incident Response', ['cia-triad'], 'Follow a structured plan when a security breach occurs'],
    ['security-audit', 'Security Auditing', ['incident-response'], 'Evaluate security controls and policies through systematic review'],
    ['risk-assessment', 'Risk Assessment', ['cia-triad'], 'Identify, analyse, and prioritise threats to an organisation'],
    ['compliance', 'Compliance Frameworks', ['risk-assessment'], 'Understand GDPR, HIPAA, and other regulatory requirements'],
    ['malware-analysis', 'Malware Analysis', ['cia-triad'], 'Classify and study viruses, worms, trojans, and ransomware'],
    ['forensics-intro', 'Digital Forensics Introduction', ['incident-response'], 'Collect and analyse digital evidence after a security incident'],
    ['ethical-hacking', 'Ethical Hacking', ['penetration-testing-intro'], 'Apply hacking skills responsibly to improve security with proper authorisation'],
  ]),

  // ---- Mobile development (15) ----
  ...topic('cs.mobile', CS, 'innovator', [CF, DW], [
    ['intro', 'Mobile Development Introduction', ['cs.web.javascript', 'cs.oop.basics'], 'Build applications designed for smartphones and tablets'],
    ['native-vs-cross', 'Native vs Cross-Platform', ['intro'], 'Compare building for one platform versus many from a single codebase'],
    ['mobile-ui', 'Mobile UI Design', ['intro'], 'Design touch-friendly interfaces with mobile UI patterns'],
    ['navigation', 'Mobile Navigation', ['mobile-ui'], 'Implement stacks, tabs, and drawers for screen-to-screen flow'],
    ['touch-input', 'Touch Input', ['mobile-ui'], 'Handle taps, swipes, pinches, and long presses in mobile apps'],
    ['sensors', 'Device Sensors', ['intro'], 'Access GPS, accelerometer, gyroscope, and camera from code'],
    ['offline-storage', 'Offline Storage', ['intro'], 'Cache data locally so apps work without network connectivity'],
    ['push-notifications', 'Push Notifications', ['intro', 'cs.networking.basics'], 'Send timely alerts to users even when the app is closed'],
    ['mobile-performance', 'Mobile Performance', ['intro'], 'Optimise battery, memory, and rendering for constrained devices'],
    ['mobile-testing', 'Mobile Testing', ['cs.testing.unit-tests', 'intro'], 'Test mobile apps on emulators and real devices'],
    ['app-lifecycle', 'App Lifecycle', ['intro'], 'Manage what happens when an app starts, pauses, resumes, and stops'],
    ['responsive-mobile', 'Responsive Mobile Design', ['mobile-ui'], 'Adapt layouts to different screen sizes and orientations'],
    ['mobile-security', 'Mobile Security', ['cs.security.basics', 'intro'], 'Protect user data with secure storage and encrypted communication'],
    ['mobile-apis', 'Mobile API Integration', ['cs.web-adv.rest-api', 'intro'], 'Consume web APIs from mobile applications'],
    ['publishing', 'App Publishing', ['intro'], 'Prepare, sign, and submit an app to platform stores'],
  ]),

  // ---- Functional programming intro (10) ----
  ...topic('cs.functional', CS, 'innovator', [CF], [
    ['pure-functions', 'Pure Functions', ['cs.functions'], 'Write functions that always produce the same output for the same input'],
    ['immutability', 'Immutability', ['cs.variables'], 'Treat data as unchangeable to prevent unexpected side effects'],
    ['higher-order', 'Higher-Order Functions', ['cs.functions'], 'Pass functions as arguments and return them from other functions'],
    ['map-filter-reduce', 'Map, Filter, Reduce', ['higher-order', 'cs.arrays'], 'Transform collections with functional operations instead of loops'],
    ['function-composition', 'Function Composition', ['higher-order'], 'Combine small functions into larger pipelines of transformations'],
    ['currying', 'Currying', ['higher-order'], 'Transform multi-argument functions into chains of single-argument functions'],
    ['closures-adv', 'Closures in Depth', ['cs.prog.closures'], 'Use closures to create private state and factory functions'],
    ['recursion-functional', 'Functional Recursion', ['cs.algorithms.recursion', 'pure-functions'], 'Solve problems recursively without mutable state'],
    ['lazy-evaluation', 'Lazy Evaluation', ['higher-order'], 'Delay computation until the result is actually needed'],
    ['monads-intro', 'Monads Introduction', ['function-composition'], 'Chain operations that may fail or have side effects in a controlled way'],
  ]),

  // ---- Concurrency & parallelism (15) ----
  ...topic('cs.concurrency', CS, 'innovator', [CF], [
    ['intro', 'Concurrency Introduction', ['cs.os.threads'], 'Run multiple tasks that overlap in time to improve throughput'],
    ['race-conditions', 'Race Conditions', ['intro'], 'Identify bugs that occur when threads access shared data simultaneously'],
    ['mutexes', 'Mutexes', ['race-conditions'], 'Lock shared resources so only one thread can access them at a time'],
    ['semaphores', 'Semaphores', ['mutexes'], 'Control access to a resource pool with counting permits'],
    ['producer-consumer', 'Producer-Consumer', ['semaphores'], 'Coordinate threads that generate and process items through a shared buffer'],
    ['thread-pools', 'Thread Pools', ['intro'], 'Reuse a fixed set of threads to reduce creation overhead'],
    ['async-await', 'Async/Await', ['cs.web.js-promises'], 'Write asynchronous code that reads like synchronous steps'],
    ['event-loops', 'Event Loops', ['async-await'], 'Process callbacks in a single-threaded loop for high-concurrency I/O'],
    ['parallel-algorithms', 'Parallel Algorithms', ['intro', 'cs.algorithms.basics'], 'Divide work across processors to solve problems faster'],
    ['map-reduce', 'MapReduce', ['parallel-algorithms'], 'Process massive datasets by mapping in parallel then reducing results'],
    ['atomic-operations', 'Atomic Operations', ['mutexes'], 'Perform indivisible read-modify-write operations without locks'],
    ['lock-free', 'Lock-Free Structures', ['atomic-operations'], 'Build data structures that progress without traditional locking'],
    ['deadlock-prevention', 'Deadlock Prevention', ['cs.os.deadlocks'], 'Design systems that structurally cannot reach a deadlocked state'],
    ['futures-promises', 'Futures and Promises', ['async-await'], 'Represent values that will be available at some point in the future'],
    ['actor-model', 'Actor Model', ['intro'], 'Model concurrency as independent actors that communicate via messages'],
  ]),

  // ---- Software architecture (10) ----
  ...topic('cs.architecture', CS, 'innovator', [CF], [
    ['monolith', 'Monolithic Architecture', ['cs.software-eng.solid-intro'], 'Build entire applications as a single deployable unit'],
    ['layered', 'Layered Architecture', ['monolith'], 'Separate concerns into presentation, business, and data layers'],
    ['client-server-arch', 'Client-Server Architecture', ['cs.networking.client-server'], 'Divide systems into front-end clients and back-end servers'],
    ['microservices-intro', 'Microservices Introduction', ['monolith', 'cs.web-adv.rest-api'], 'Decompose an application into small, independently deployable services'],
    ['event-driven-arch', 'Event-Driven Architecture', ['cs.patterns.observer'], 'Build systems that react to events published by other components'],
    ['message-queues', 'Message Queues', ['event-driven-arch'], 'Decouple producers and consumers with persistent message buffers'],
    ['cqrs', 'CQRS', ['event-driven-arch'], 'Separate read models from write models for optimised query and command paths'],
    ['hexagonal', 'Hexagonal Architecture', ['layered', 'cs.software-eng.dip'], 'Isolate core business logic from external adapters and frameworks'],
    ['domain-driven', 'Domain-Driven Design Introduction', ['hexagonal'], 'Model software around business domains with ubiquitous language'],
    ['system-design', 'System Design Basics', ['microservices-intro', 'cs.db-adv.sharding-intro'], 'Design scalable, reliable systems by combining patterns and trade-offs'],
  ]),
];

// ===========================================================================
// COMPUTER SCIENCE — CREATOR  (~280 skills)
// Distributed systems, architecture, compilers, AI/ML, cloud, quantum, graphics
// ===========================================================================

const csCreator: SkillNode[] = [

  // ---- Preserved skills ----
  skill('cs.ai.basics', 'AI Basics', CS, 'creator',
    ['cs.algorithms.basics', 'math.statistics.descriptive', 'math.linear-algebra'],
    'Understand artificial intelligence as machines that learn and make decisions', [CF, DW]),
  skill('cs.machine-learning', 'Machine Learning', CS, 'creator',
    ['cs.ai.basics', 'math.calculus', 'math.statistics.inference'],
    'Train models that improve from experience without explicit programming', [CF, DW]),

  // ---- Distributed systems (25) ----
  ...topic('cs.distributed', CS, 'creator', [CF], [
    ['intro', 'Distributed Systems Introduction', ['cs.networking.tcp-ip', 'cs.os.processes'], 'Build systems whose components run on multiple networked computers'],
    ['cap-theorem', 'CAP Theorem', ['intro'], 'Understand the trade-off between consistency, availability, and partition tolerance'],
    ['consistency-models', 'Consistency Models', ['cap-theorem'], 'Choose between strong, eventual, and causal consistency for your system'],
    ['consensus', 'Consensus Algorithms', ['intro'], 'Achieve agreement among distributed nodes with Paxos or Raft'],
    ['replication', 'Data Replication', ['consistency-models'], 'Copy data across nodes for fault tolerance and read performance'],
    ['leader-election', 'Leader Election', ['consensus'], 'Choose one node to coordinate actions in a distributed group'],
    ['partitioning', 'Data Partitioning', ['replication'], 'Split data across nodes to distribute load and storage'],
    ['consistent-hashing', 'Consistent Hashing', ['partitioning', 'cs.data-structures.hash-tables'], 'Map keys to nodes so adding or removing a node moves minimal data'],
    ['vector-clocks', 'Vector Clocks', ['consistency-models'], 'Track causality across distributed events without a global clock'],
    ['distributed-transactions', 'Distributed Transactions', ['consensus', 'cs.db-adv.transactions'], 'Coordinate atomic operations across multiple database nodes'],
    ['two-phase-commit', 'Two-Phase Commit', ['distributed-transactions'], 'Ensure all nodes agree to commit or abort a distributed transaction'],
    ['saga-pattern', 'Saga Pattern', ['distributed-transactions'], 'Manage long-running transactions as a sequence of compensatable steps'],
    ['microservices', 'Microservices Architecture', ['cs.architecture.microservices-intro'], 'Design, deploy, and manage fine-grained independently scalable services'],
    ['service-discovery', 'Service Discovery', ['microservices'], 'Let services find each other dynamically as they scale and move'],
    ['api-gateway', 'API Gateway', ['microservices', 'cs.web-adv.rest-api'], 'Route, throttle, and secure external access through a single entry point'],
    ['circuit-breaker', 'Circuit Breaker Pattern', ['microservices'], 'Prevent cascading failures by temporarily stopping calls to failing services'],
    ['event-sourcing', 'Event Sourcing', ['cs.architecture.event-driven-arch'], 'Store every state change as an immutable event for full audit history'],
    ['distributed-caching', 'Distributed Caching', ['replication'], 'Cache frequently accessed data across nodes for faster reads'],
    ['distributed-logging', 'Distributed Logging', ['microservices'], 'Aggregate and correlate logs from many services for debugging'],
    ['distributed-tracing', 'Distributed Tracing', ['distributed-logging'], 'Follow a request as it flows through multiple services'],
    ['idempotency', 'Idempotency', ['microservices'], 'Design operations that produce the same result even if executed multiple times'],
    ['rate-limiting', 'Rate Limiting', ['api-gateway'], 'Protect services from overload by capping request frequency'],
    ['backpressure', 'Backpressure', ['cs.architecture.message-queues'], 'Slow producers when consumers cannot keep up to prevent queue overflow'],
    ['gossip-protocols', 'Gossip Protocols', ['intro'], 'Spread information across nodes using probabilistic peer-to-peer communication'],
    ['distributed-testing', 'Distributed System Testing', ['intro', 'cs.software-eng.integration-testing'], 'Test distributed systems with chaos engineering and fault injection'],
  ]),

  // ---- Computer architecture (25) ----
  ...topic('cs.comp-arch', CS, 'creator', [CF], [
    ['logic-gates', 'Logic Gates', ['cs.logic.truth-tables'], 'Combine AND, OR, NOT, and XOR gates to build digital circuits'],
    ['combinational', 'Combinational Circuits', ['logic-gates'], 'Build adders, multiplexers, and decoders from logic gates'],
    ['sequential', 'Sequential Circuits', ['combinational'], 'Add memory to circuits with flip-flops and registers'],
    ['alu', 'Arithmetic Logic Unit', ['combinational'], 'Design the circuit that performs all arithmetic and logic operations'],
    ['cpu-design', 'CPU Design', ['alu', 'sequential'], 'Combine ALU, registers, and control unit into a working processor'],
    ['instruction-set', 'Instruction Set Architecture', ['cpu-design'], 'Define the set of operations a CPU can execute'],
    ['assembly', 'Assembly Language', ['instruction-set'], 'Write programs in low-level mnemonics that map directly to machine code'],
    ['fetch-decode-execute', 'Fetch-Decode-Execute Cycle', ['cpu-design'], 'Trace how the CPU fetches an instruction, decodes it, and executes it'],
    ['pipelining', 'Pipelining', ['fetch-decode-execute'], 'Overlap instruction stages to start a new instruction every clock cycle'],
    ['hazards', 'Pipeline Hazards', ['pipelining'], 'Detect and resolve data, control, and structural hazards in pipelines'],
    ['branch-prediction', 'Branch Prediction', ['hazards'], 'Guess which way a branch will go to keep the pipeline full'],
    ['cache-memory', 'Cache Memory', ['cpu-design'], 'Store recently used data close to the CPU for faster access'],
    ['cache-policies', 'Cache Policies', ['cache-memory'], 'Choose write-through, write-back, and replacement policies for caches'],
    ['memory-hierarchy', 'Memory Hierarchy', ['cache-memory'], 'Balance speed, size, and cost across registers, cache, RAM, and disk'],
    ['virtual-memory-hw', 'Virtual Memory Hardware', ['memory-hierarchy', 'cs.os.paging'], 'Translate virtual addresses to physical with page tables and TLBs'],
    ['superscalar', 'Superscalar Processors', ['pipelining'], 'Issue multiple instructions per cycle for instruction-level parallelism'],
    ['out-of-order', 'Out-of-Order Execution', ['superscalar'], 'Execute instructions as soon as operands are ready regardless of program order'],
    ['simd', 'SIMD', ['superscalar'], 'Apply one instruction to multiple data elements simultaneously'],
    ['multicore', 'Multicore Processors', ['superscalar'], 'Place multiple processor cores on a single chip for true parallelism'],
    ['cache-coherence', 'Cache Coherence', ['multicore', 'cache-memory'], 'Keep caches consistent when multiple cores share memory'],
    ['gpu-architecture', 'GPU Architecture', ['simd'], 'Design massively parallel processors optimised for graphics and computation'],
    ['fpga', 'FPGAs', ['combinational', 'sequential'], 'Program reconfigurable hardware for custom logic at near-ASIC speed'],
    ['memory-types', 'Memory Technologies', ['memory-hierarchy'], 'Compare SRAM, DRAM, flash, and emerging non-volatile memory types'],
    ['bus-architecture', 'Bus Architecture', ['cpu-design'], 'Connect CPU, memory, and I/O through shared communication channels'],
    ['power-efficiency', 'Power Efficiency', ['cpu-design'], 'Reduce energy consumption with clock gating, voltage scaling, and sleep modes'],
  ]),

  // ---- Compilers & interpreters (25) ----
  ...topic('cs.compilers', CS, 'creator', [CF], [
    ['intro', 'Compiler Introduction', ['cs.functions', 'cs.data-structures.trees'], 'Understand how source code is translated into executable machine code'],
    ['lexing', 'Lexical Analysis', ['intro', 'cs.regex.intro'], 'Break source text into a stream of tokens with a scanner'],
    ['tokens', 'Token Design', ['lexing'], 'Define token types for keywords, identifiers, literals, and operators'],
    ['parsing', 'Parsing', ['lexing', 'cs.data-structures.trees'], 'Build a parse tree from tokens using grammar rules'],
    ['grammars', 'Formal Grammars', ['parsing'], 'Describe language syntax with context-free grammar productions'],
    ['recursive-descent', 'Recursive Descent Parsing', ['parsing', 'cs.algorithms.recursion'], 'Write a parser where each grammar rule becomes a function'],
    ['ast', 'Abstract Syntax Trees', ['parsing'], 'Represent program structure as a tree stripped of syntactic noise'],
    ['semantic-analysis', 'Semantic Analysis', ['ast'], 'Check type correctness, variable scope, and other meaning constraints'],
    ['type-checking', 'Type Checking', ['semantic-analysis'], 'Verify that operations receive values of compatible types'],
    ['symbol-tables', 'Symbol Tables', ['semantic-analysis', 'cs.data-structures.hash-tables'], 'Track variables, functions, and types in a lookup table during compilation'],
    ['ir', 'Intermediate Representation', ['ast'], 'Transform the AST into a platform-independent intermediate form'],
    ['three-address', 'Three-Address Code', ['ir'], 'Represent operations as simple three-operand instructions'],
    ['optimisation-intro', 'Optimisation Introduction', ['ir'], 'Improve generated code for speed or size without changing behaviour'],
    ['constant-folding', 'Constant Folding', ['optimisation-intro'], 'Evaluate constant expressions at compile time instead of runtime'],
    ['dead-code', 'Dead Code Elimination', ['optimisation-intro'], 'Remove code that can never execute or whose result is unused'],
    ['loop-optimisation', 'Loop Optimisation', ['optimisation-intro'], 'Move invariant computations out of loops and unroll small loops'],
    ['register-allocation', 'Register Allocation', ['ir', 'cs.comp-arch.cpu-design'], 'Assign variables to CPU registers to minimise memory access'],
    ['code-generation', 'Code Generation', ['register-allocation'], 'Emit machine code or bytecode from the intermediate representation'],
    ['linker', 'Linking', ['code-generation'], 'Combine object files and resolve symbol references into an executable'],
    ['interpreters', 'Interpreters', ['ast'], 'Execute programs by walking the AST directly without generating machine code'],
    ['bytecode', 'Bytecode & Virtual Machines', ['interpreters'], 'Compile to portable bytecode and run it on a virtual machine'],
    ['jit', 'Just-In-Time Compilation', ['bytecode', 'code-generation'], 'Compile hot code paths at runtime for near-native performance'],
    ['garbage-collection', 'Garbage Collection', ['interpreters'], 'Reclaim unused memory automatically with mark-sweep or generational collection'],
    ['parser-generators', 'Parser Generators', ['grammars'], 'Use tools that auto-generate parsers from grammar specifications'],
    ['dsl', 'Domain-Specific Languages', ['intro', 'grammars'], 'Design small specialised languages tailored to a particular problem domain'],
  ]),

  // ---- AI & Machine Learning (30) ----
  ...topic('cs.ml', CS, 'creator', [CF, DW], [
    ['supervised', 'Supervised Learning', ['cs.machine-learning'], 'Train models on labelled data to predict outputs for new inputs'],
    ['unsupervised', 'Unsupervised Learning', ['cs.machine-learning'], 'Find hidden patterns in data without labelled examples'],
    ['reinforcement', 'Reinforcement Learning', ['cs.machine-learning'], 'Train agents to maximise rewards through trial-and-error interaction'],
    ['linear-regression', 'Linear Regression', ['supervised', 'math.calculus.derivatives'], 'Fit a straight line through data to predict continuous values'],
    ['logistic-regression', 'Logistic Regression', ['linear-regression'], 'Classify data into categories using a sigmoid function'],
    ['decision-trees', 'Decision Trees', ['supervised'], 'Make predictions by learning a tree of yes/no decisions from data'],
    ['random-forests', 'Random Forests', ['decision-trees'], 'Combine many decision trees for more robust predictions'],
    ['svm', 'Support Vector Machines', ['supervised', 'math.linear-algebra'], 'Find the optimal boundary that separates classes with maximum margin'],
    ['k-nearest', 'K-Nearest Neighbours', ['supervised'], 'Classify a point by the majority vote of its closest neighbours'],
    ['k-means', 'K-Means Clustering', ['unsupervised'], 'Group data into k clusters by minimising distance to cluster centres'],
    ['hierarchical-clustering', 'Hierarchical Clustering', ['unsupervised'], 'Build a tree of nested clusters by merging or splitting groups'],
    ['pca', 'Principal Component Analysis', ['unsupervised', 'math.linear-algebra'], 'Reduce dimensions by projecting data onto its most informative directions'],
    ['neural-network-intro', 'Neural Networks Introduction', ['supervised', 'math.calculus'], 'Connect artificial neurons in layers to learn complex functions'],
    ['backpropagation', 'Backpropagation', ['neural-network-intro', 'math.calculus.derivatives'], 'Train neural networks by propagating errors backward through layers'],
    ['activation-functions', 'Activation Functions', ['neural-network-intro'], 'Add non-linearity with sigmoid, ReLU, and softmax functions'],
    ['deep-learning', 'Deep Learning', ['backpropagation'], 'Stack many hidden layers to learn hierarchical representations'],
    ['cnn', 'Convolutional Neural Networks', ['deep-learning'], 'Extract spatial features from images with learnable filters'],
    ['rnn', 'Recurrent Neural Networks', ['deep-learning'], 'Process sequential data by maintaining hidden state across time steps'],
    ['lstm', 'LSTM Networks', ['rnn'], 'Remember long-range dependencies with gated memory cells'],
    ['transformers', 'Transformers', ['deep-learning', 'math.linear-algebra'], 'Process sequences in parallel with self-attention mechanisms'],
    ['nlp-intro', 'Natural Language Processing', ['transformers'], 'Enable computers to understand, generate, and translate human language'],
    ['computer-vision', 'Computer Vision', ['cnn'], 'Enable machines to interpret and understand visual information'],
    ['object-detection', 'Object Detection', ['computer-vision'], 'Locate and classify objects within images with bounding boxes'],
    ['gan', 'Generative Adversarial Networks', ['deep-learning'], 'Generate realistic data by pitting a generator against a discriminator'],
    ['transfer-learning', 'Transfer Learning', ['deep-learning'], 'Adapt a model trained on one task to perform well on a related task'],
    ['model-evaluation', 'Model Evaluation', ['supervised'], 'Measure accuracy, precision, recall, F1-score, and AUC of models'],
    ['overfitting', 'Overfitting & Regularisation', ['model-evaluation'], 'Prevent models from memorising training data instead of learning patterns'],
    ['feature-engineering', 'Feature Engineering', ['cs.machine-learning'], 'Create and select the most informative input features for models'],
    ['ethics-ai', 'AI Ethics', ['cs.machine-learning'], 'Address bias, fairness, transparency, and accountability in AI systems'],
    ['ml-ops', 'ML Operations', ['model-evaluation'], 'Deploy, monitor, and retrain machine learning models in production'],
  ]),

  // ---- Cloud computing (20) ----
  ...topic('cs.cloud', CS, 'creator', [CF, DW], [
    ['intro', 'Cloud Computing Introduction', ['cs.networking.client-server', 'cs.os.virtualisation-intro'], 'Use on-demand computing resources hosted on remote data centres'],
    ['iaas', 'Infrastructure as a Service', ['intro'], 'Rent virtual machines, storage, and networking from a cloud provider'],
    ['paas', 'Platform as a Service', ['iaas'], 'Deploy applications on a managed platform without managing servers'],
    ['saas', 'Software as a Service', ['intro'], 'Deliver applications over the internet accessed through a browser'],
    ['virtual-machines', 'Cloud Virtual Machines', ['iaas'], 'Create and configure virtual servers in the cloud on demand'],
    ['containers-cloud', 'Containers in the Cloud', ['cs.os.containers-intro', 'iaas'], 'Package and run containerised applications on cloud infrastructure'],
    ['orchestration', 'Container Orchestration', ['containers-cloud'], 'Manage clusters of containers with automated scaling, healing, and rollout'],
    ['serverless', 'Serverless Computing', ['paas'], 'Run functions on demand without provisioning or managing servers'],
    ['object-storage', 'Object Storage', ['iaas'], 'Store unstructured data in scalable buckets with HTTP access'],
    ['managed-databases', 'Managed Databases', ['iaas', 'cs.databases.sql'], 'Use cloud-managed database services with automatic backup and scaling'],
    ['auto-scaling', 'Auto-Scaling', ['iaas'], 'Adjust the number of instances automatically based on demand'],
    ['cloud-networking', 'Cloud Networking', ['iaas', 'cs.networking.subnetting'], 'Configure virtual networks, subnets, and security groups in the cloud'],
    ['load-balancing-cloud', 'Cloud Load Balancing', ['auto-scaling', 'cs.networking.load-balancing'], 'Distribute traffic across cloud instances for high availability'],
    ['cdn-cloud', 'Cloud CDN', ['object-storage', 'cs.networking.cdn'], 'Serve static assets from edge locations for low-latency delivery'],
    ['iam', 'Identity & Access Management', ['intro', 'cs.security.access-control'], 'Control who can access cloud resources and what they can do'],
    ['monitoring', 'Cloud Monitoring', ['intro'], 'Collect metrics, set alerts, and visualise cloud resource health'],
    ['logging-cloud', 'Cloud Logging', ['monitoring'], 'Aggregate and search application logs across cloud services'],
    ['cost-management', 'Cost Management', ['intro'], 'Track, optimise, and forecast cloud spending to stay within budget'],
    ['multi-cloud', 'Multi-Cloud Strategy', ['intro'], 'Use multiple cloud providers to avoid vendor lock-in and improve resilience'],
    ['cloud-security', 'Cloud Security', ['iam', 'cs.security.basics'], 'Secure cloud workloads with encryption, policies, and compliance tools'],
  ]),

  // ---- Blockchain (10) ----
  ...topic('cs.blockchain', CS, 'creator', [CF, DW], [
    ['intro', 'Blockchain Introduction', ['cs.security.hashing', 'cs.distributed.intro'], 'Store data in an immutable chain of cryptographically linked blocks'],
    ['distributed-ledger', 'Distributed Ledger', ['intro'], 'Share a tamper-proof ledger across many nodes without a central authority'],
    ['consensus-mechanisms', 'Consensus Mechanisms', ['distributed-ledger'], 'Compare proof-of-work, proof-of-stake, and other agreement protocols'],
    ['smart-contracts', 'Smart Contracts', ['distributed-ledger'], 'Write self-executing agreements that run on a blockchain'],
    ['tokens', 'Tokens & Cryptocurrencies', ['smart-contracts'], 'Create and transfer digital assets on a blockchain network'],
    ['merkle-trees', 'Merkle Trees', ['intro', 'cs.data-structures.trees'], 'Verify data integrity efficiently with hash trees'],
    ['defi-intro', 'DeFi Introduction', ['smart-contracts'], 'Explore decentralised finance protocols built on blockchain'],
    ['nft-intro', 'NFT Introduction', ['tokens'], 'Understand non-fungible tokens as unique digital ownership certificates'],
    ['blockchain-security', 'Blockchain Security', ['smart-contracts'], 'Identify and mitigate vulnerabilities in smart contracts and protocols'],
    ['blockchain-scalability', 'Blockchain Scalability', ['consensus-mechanisms'], 'Address throughput limits with sharding, rollups, and layer-2 solutions'],
  ]),

  // ---- Quantum computing (10) ----
  ...topic('cs.quantum', CS, 'creator', [CF, DW], [
    ['intro', 'Quantum Computing Introduction', ['cs.comp-arch.logic-gates', 'math.linear-algebra'], 'Harness quantum mechanics to process information in fundamentally new ways'],
    ['qubits', 'Qubits', ['intro'], 'Represent information with quantum bits that can be 0, 1, or both at once'],
    ['superposition', 'Superposition', ['qubits'], 'Exploit the ability of qubits to exist in multiple states simultaneously'],
    ['entanglement', 'Entanglement', ['superposition'], 'Link qubits so measuring one instantly reveals the state of another'],
    ['quantum-gates', 'Quantum Gates', ['qubits'], 'Apply unitary operations to transform qubit states'],
    ['quantum-circuits', 'Quantum Circuits', ['quantum-gates'], 'Build algorithms by composing sequences of quantum gates'],
    ['grovers', 'Grover\'s Algorithm', ['quantum-circuits'], 'Search an unsorted database quadratically faster than classical methods'],
    ['shors', 'Shor\'s Algorithm', ['quantum-circuits'], 'Factor large integers exponentially faster than any known classical algorithm'],
    ['quantum-error', 'Quantum Error Correction', ['quantum-circuits'], 'Protect quantum computations from decoherence and noise'],
    ['quantum-ml', 'Quantum Machine Learning', ['quantum-circuits', 'cs.machine-learning'], 'Explore potential quantum speed-ups for machine learning tasks'],
  ]),

  // ---- Programming languages theory (20) ----
  ...topic('cs.pl-theory', CS, 'creator', [CF], [
    ['type-systems', 'Type Systems', ['cs.data-types', 'cs.compilers.type-checking'], 'Classify values into types to catch errors before runtime'],
    ['static-vs-dynamic', 'Static vs Dynamic Typing', ['type-systems'], 'Compare compile-time type checking with runtime type checking'],
    ['type-inference', 'Type Inference', ['type-systems'], 'Let the compiler deduce types without explicit annotations'],
    ['generics', 'Generics', ['type-systems'], 'Write code that works with any type while retaining type safety'],
    ['algebraic-types', 'Algebraic Data Types', ['generics'], 'Model data with sum types (enums) and product types (records)'],
    ['pattern-matching', 'Pattern Matching', ['algebraic-types'], 'Destructure data and branch on its shape in a single expression'],
    ['functional-purity', 'Functional Programming in Depth', ['cs.functional.pure-functions'], 'Build systems entirely from pure functions and immutable data'],
    ['effect-systems', 'Effect Systems', ['functional-purity'], 'Track side effects in the type system to reason about code purity'],
    ['ownership', 'Ownership & Borrowing', ['type-systems'], 'Manage memory safety without garbage collection using ownership rules'],
    ['lifetime-analysis', 'Lifetime Analysis', ['ownership'], 'Ensure references never outlive the data they point to'],
    ['concurrency-models', 'Concurrency Models', ['cs.concurrency.intro'], 'Compare threads, green threads, actors, and CSP for concurrent programming'],
    ['csp', 'Communicating Sequential Processes', ['concurrency-models'], 'Coordinate concurrent processes that communicate through channels'],
    ['metaprogramming', 'Metaprogramming', ['cs.compilers.ast'], 'Write code that generates or transforms other code at compile time'],
    ['macros', 'Macros', ['metaprogramming'], 'Define compile-time transformations that expand into regular code'],
    ['reflection', 'Reflection', ['metaprogramming'], 'Inspect and modify program structure at runtime'],
    ['language-design', 'Language Design', ['cs.compilers.grammars', 'type-systems'], 'Design syntax and semantics for a new programming language'],
    ['formal-verification', 'Formal Verification', ['type-systems', 'math.discrete.logic'], 'Prove program correctness mathematically instead of just testing'],
    ['dependent-types', 'Dependent Types', ['generics', 'formal-verification'], 'Express detailed properties of values in the type system itself'],
    ['category-theory', 'Category Theory for Programmers', ['cs.functional.monads-intro', 'math.algebra'], 'Apply abstract mathematical structures to organise programming concepts'],
    ['language-paradigms', 'Language Paradigm Comparison', ['functional-purity', 'cs.oop.polymorphism'], 'Compare imperative, functional, logic, and concurrent programming paradigms'],
  ]),

  // ---- Graphics programming (20) ----
  ...topic('cs.graphics', CS, 'creator', [CF, DW], [
    ['intro', 'Graphics Programming Introduction', ['math.linear-algebra', 'cs.arrays'], 'Render images by computing colour values for every pixel on screen'],
    ['coordinate-systems', 'Coordinate Systems', ['intro', 'math.geometry.coordinate-plane'], 'Transform between world, camera, and screen coordinate spaces'],
    ['transformations', 'Transformations', ['coordinate-systems', 'math.linear-algebra'], 'Move, rotate, and scale objects using matrix multiplication'],
    ['rendering-pipeline', 'Rendering Pipeline', ['transformations'], 'Follow geometry from vertices through rasterisation to pixels on screen'],
    ['rasterisation', 'Rasterisation', ['rendering-pipeline'], 'Convert vector geometry into discrete pixels for display'],
    ['shaders-intro', 'Shaders Introduction', ['rendering-pipeline'], 'Write small GPU programs that control how each vertex or pixel is drawn'],
    ['vertex-shaders', 'Vertex Shaders', ['shaders-intro'], 'Transform vertex positions and pass data to the fragment stage'],
    ['fragment-shaders', 'Fragment Shaders', ['shaders-intro'], 'Calculate the final colour of each pixel on a surface'],
    ['textures', 'Textures', ['fragment-shaders'], 'Map 2D images onto 3D surfaces for realistic detail'],
    ['lighting', 'Lighting Models', ['fragment-shaders', 'math.trig.basics'], 'Simulate how light interacts with surfaces using Phong or PBR models'],
    ['shadows', 'Shadow Techniques', ['lighting'], 'Render shadows with shadow maps or shadow volumes'],
    ['camera', 'Camera & Projection', ['transformations'], 'Set up perspective and orthographic views of a 3D scene'],
    ['depth-buffer', 'Depth Buffering', ['rasterisation'], 'Determine which surfaces are visible by comparing pixel depths'],
    ['anti-aliasing', 'Anti-Aliasing', ['rasterisation'], 'Smooth jagged edges with multi-sampling and post-processing'],
    ['ray-tracing', 'Ray Tracing', ['lighting'], 'Simulate light rays bouncing through a scene for photorealistic images'],
    ['path-tracing', 'Path Tracing', ['ray-tracing'], 'Trace many random light paths per pixel for global illumination'],
    ['acceleration-structures', 'Acceleration Structures', ['ray-tracing', 'cs.adv-structures.spatial-structures'], 'Speed up ray intersection tests with BVH and octree structures'],
    ['deferred-rendering', 'Deferred Rendering', ['rendering-pipeline'], 'Separate geometry and lighting passes for efficient many-light scenes'],
    ['post-processing', 'Post-Processing', ['rendering-pipeline'], 'Apply bloom, tone mapping, and colour grading after rendering'],
    ['animation-graphics', 'Animation Systems', ['transformations'], 'Animate characters with skeletal rigs, keyframes, and interpolation'],
  ]),

  // ---- Game development (20) ----
  ...topic('cs.gamedev', CS, 'creator', [CF, DW], [
    ['intro', 'Game Development Introduction', ['cs.oop.basics', 'cs.graphics.intro'], 'Build interactive experiences with real-time rendering and input'],
    ['game-loop', 'Game Loop', ['intro'], 'Update game state, process input, and render frames in a continuous loop'],
    ['entity-component', 'Entity-Component Systems', ['game-loop', 'cs.patterns.composite'], 'Compose game objects from modular data components instead of deep inheritance'],
    ['physics-engine', 'Physics Engines', ['game-loop', 'math.calculus'], 'Simulate gravity, collisions, and rigid body dynamics in real time'],
    ['collision-detection', 'Collision Detection', ['physics-engine'], 'Detect when game objects touch using bounding boxes and spatial hashing'],
    ['collision-response', 'Collision Response', ['collision-detection'], 'React to collisions with bouncing, sliding, and damage mechanics'],
    ['input-handling', 'Input Handling', ['game-loop'], 'Map keyboard, mouse, touch, and gamepad actions to game commands'],
    ['audio-engine', 'Game Audio', ['game-loop'], 'Play sound effects and music with spatial positioning and mixing'],
    ['scene-graph', 'Scene Graphs', ['entity-component', 'cs.data-structures.trees'], 'Organise game objects in a tree for efficient updating and rendering'],
    ['pathfinding', 'Pathfinding', ['cs.adv-algorithms.bfs', 'cs.adv-algorithms.heuristics'], 'Find the shortest route for characters using A* and navigation meshes'],
    ['ai-game', 'Game AI', ['pathfinding'], 'Give non-player characters believable behaviour with state machines and behaviour trees'],
    ['procedural-gen', 'Procedural Generation', ['cs.algorithms.recursion', 'math.probability.basic'], 'Create infinite worlds, dungeons, and terrain from algorithms and random seeds'],
    ['level-design', 'Level Design', ['intro'], 'Craft engaging spaces that guide the player and teach mechanics organically'],
    ['ui-game', 'Game UI Systems', ['intro', 'cs.web.css-layout'], 'Build heads-up displays, menus, and inventory screens'],
    ['networking-game', 'Multiplayer Networking', ['cs.networking.sockets', 'game-loop'], 'Synchronise game state across players with client-server or peer-to-peer models'],
    ['state-machines-game', 'State Machines for Games', ['game-loop'], 'Model character and game states with finite state machines'],
    ['particle-systems', 'Particle Systems', ['game-loop', 'cs.graphics.shaders-intro'], 'Render fire, smoke, rain, and magic effects with thousands of tiny particles'],
    ['animation-game', 'Game Animation', ['cs.graphics.animation-graphics'], 'Blend, layer, and transition animations for responsive character movement'],
    ['serialisation', 'Save & Load Systems', ['game-loop', 'cs.io.json-files'], 'Serialise game state to disk and restore it for save games'],
    ['optimisation-game', 'Game Optimisation', ['game-loop'], 'Profile and optimise frame rate with culling, LOD, and batching techniques'],
  ]),

  // ---- DevOps (20) ----
  ...topic('cs.devops', CS, 'creator', [CF], [
    ['intro', 'DevOps Introduction', ['cs.vcs.collaboration', 'cs.cli.scripts'], 'Bridge development and operations for faster, more reliable delivery'],
    ['ci', 'Continuous Integration', ['intro', 'cs.testing.unit-tests'], 'Merge and test code automatically on every commit'],
    ['cd', 'Continuous Delivery', ['ci'], 'Keep code always ready to deploy with automated pipelines'],
    ['cd-deployment', 'Continuous Deployment', ['cd'], 'Deploy every successful build to production automatically'],
    ['iac', 'Infrastructure as Code', ['cs.cloud.iaas', 'cs.cli.scripts'], 'Define and provision infrastructure through version-controlled code'],
    ['config-management', 'Configuration Management', ['iac'], 'Automate consistent server configuration with declarative tools'],
    ['docker', 'Docker', ['cs.os.containers-intro'], 'Build, ship, and run applications in lightweight containers'],
    ['docker-compose', 'Docker Compose', ['docker'], 'Define and run multi-container applications with a single configuration file'],
    ['kubernetes-intro', 'Kubernetes Introduction', ['docker', 'cs.cloud.orchestration'], 'Orchestrate containers across clusters with automated scheduling and scaling'],
    ['helm', 'Helm Charts', ['kubernetes-intro'], 'Package and version Kubernetes applications as reusable charts'],
    ['monitoring-devops', 'Monitoring & Alerting', ['cs.cloud.monitoring'], 'Track metrics, set alerts, and build dashboards for production systems'],
    ['logging-devops', 'Centralised Logging', ['cs.cloud.logging-cloud'], 'Aggregate logs from all services into a searchable central platform'],
    ['tracing', 'Distributed Tracing', ['logging-devops'], 'Trace requests across microservices to diagnose latency issues'],
    ['gitops', 'GitOps', ['cd', 'iac'], 'Use Git as the single source of truth for infrastructure and deployments'],
    ['blue-green', 'Blue-Green Deployments', ['cd-deployment'], 'Switch traffic between two identical environments for zero-downtime deploys'],
    ['canary', 'Canary Deployments', ['cd-deployment'], 'Roll out changes to a small subset of users before full deployment'],
    ['feature-flags', 'Feature Flags', ['cd'], 'Toggle features on and off without redeploying code'],
    ['chaos-engineering', 'Chaos Engineering', ['monitoring-devops', 'cs.distributed.distributed-testing'], 'Inject failures deliberately to build confidence in system resilience'],
    ['sre', 'Site Reliability Engineering', ['monitoring-devops'], 'Apply software engineering practices to operations and reliability'],
    ['incident-management', 'Incident Management', ['sre'], 'Respond to production outages with structured processes and post-mortems'],
  ]),

  // ---- Advanced security (20) ----
  ...topic('cs.adv-security', CS, 'creator', [CF, DW], [
    ['crypto-protocols', 'Cryptographic Protocols', ['cs.security.asymmetric-encryption', 'cs.security.digital-signatures'], 'Design protocols like TLS and SSH that provide secure communication'],
    ['key-exchange', 'Key Exchange', ['crypto-protocols'], 'Establish shared secrets over insecure channels with Diffie-Hellman'],
    ['pki', 'Public Key Infrastructure', ['cs.security.certificates'], 'Manage digital certificates and certificate authorities at scale'],
    ['zero-knowledge', 'Zero-Knowledge Proofs', ['crypto-protocols'], 'Prove you know a secret without revealing the secret itself'],
    ['homomorphic', 'Homomorphic Encryption', ['crypto-protocols'], 'Compute on encrypted data without decrypting it first'],
    ['network-forensics', 'Network Forensics', ['cs.security.forensics-intro', 'cs.networking.tcp-ip'], 'Capture and analyse network traffic to investigate security incidents'],
    ['reverse-engineering', 'Reverse Engineering', ['cs.comp-arch.assembly'], 'Analyse compiled programs to understand their behaviour without source code'],
    ['binary-exploitation', 'Binary Exploitation', ['reverse-engineering'], 'Discover and exploit memory corruption vulnerabilities in compiled programs'],
    ['buffer-overflow', 'Buffer Overflows', ['binary-exploitation'], 'Understand how writing past buffer boundaries can hijack program control'],
    ['web-pentest', 'Web Penetration Testing', ['cs.security.ethical-hacking', 'cs.web-adv.web-security'], 'Systematically test web applications for security vulnerabilities'],
    ['threat-modelling', 'Threat Modelling', ['cs.security.risk-assessment'], 'Identify potential threats and design mitigations before building systems'],
    ['security-architecture', 'Security Architecture', ['threat-modelling'], 'Design systems with defence-in-depth and least-privilege principles'],
    ['siem', 'SIEM Systems', ['cs.security.network-security-adv'], 'Correlate security events across an organisation to detect threats'],
    ['ids-ips', 'IDS and IPS', ['cs.security.network-security-adv'], 'Detect and prevent network intrusions with signature and anomaly analysis'],
    ['container-security', 'Container Security', ['cs.devops.docker', 'cs.security.basics'], 'Secure containerised applications with scanning, policies, and runtime protection'],
    ['cloud-sec-adv', 'Advanced Cloud Security', ['cs.cloud.cloud-security'], 'Implement zero-trust, encryption at rest, and workload identity in the cloud'],
    ['supply-chain', 'Supply Chain Security', ['cs.devops.ci'], 'Protect the software supply chain from compromised dependencies and build tools'],
    ['privacy-engineering', 'Privacy Engineering', ['cs.security.basics'], 'Design systems that minimise data collection and protect user privacy'],
    ['bug-bounty', 'Bug Bounty Programs', ['cs.security.ethical-hacking'], 'Participate in structured programs that reward responsible vulnerability disclosure'],
    ['security-automation', 'Security Automation', ['cs.devops.ci', 'cs.security.vulnerability-scanning'], 'Automate security scanning, patching, and compliance checking in pipelines'],
  ]),

  // ---- Data science & analytics (15) ----
  ...topic('cs.data-science', CS, 'creator', [CF, DW], [
    ['intro', 'Data Science Introduction', ['cs.machine-learning', 'math.statistics.descriptive'], 'Extract knowledge and insights from structured and unstructured data'],
    ['data-cleaning', 'Data Cleaning', ['intro'], 'Handle missing values, duplicates, and inconsistencies in raw datasets'],
    ['exploratory', 'Exploratory Data Analysis', ['data-cleaning'], 'Summarise, visualise, and understand the shape and distribution of data'],
    ['statistical-testing', 'Statistical Testing', ['exploratory', 'math.statistics.inference'], 'Apply hypothesis tests to determine if results are statistically significant'],
    ['data-pipelines', 'Data Pipelines', ['data-cleaning'], 'Automate the flow of data from sources through transformations to storage'],
    ['etl', 'ETL Processes', ['data-pipelines'], 'Extract data from sources, transform it, and load into a data warehouse'],
    ['data-warehousing', 'Data Warehousing', ['etl', 'cs.databases.sql'], 'Store large volumes of historical data optimised for analytical queries'],
    ['data-visualisation', 'Data Visualisation', ['exploratory'], 'Create informative charts, dashboards, and interactive visualisations'],
    ['time-series', 'Time Series Analysis', ['exploratory', 'math.statistics.inference'], 'Analyse data points collected over time to detect trends and seasonality'],
    ['ab-testing', 'A/B Testing', ['statistical-testing'], 'Compare two versions of a product to determine which performs better'],
    ['recommendation-systems', 'Recommendation Systems', ['cs.ml.k-nearest', 'cs.ml.unsupervised'], 'Suggest relevant items to users based on behaviour and preferences'],
    ['text-mining', 'Text Mining', ['cs.ml.nlp-intro'], 'Extract structured information from unstructured text documents'],
    ['anomaly-detection', 'Anomaly Detection', ['cs.ml.unsupervised'], 'Identify unusual patterns that deviate significantly from expected behaviour'],
    ['big-data-intro', 'Big Data Introduction', ['data-pipelines'], 'Process datasets too large for a single machine with distributed frameworks'],
    ['data-ethics', 'Data Ethics', ['intro'], 'Handle data responsibly with attention to consent, bias, and fairness'],
  ]),

  // ---- Additional creator topics (20) ----
  ...topic('cs.advanced', CS, 'creator', [CF, DW], [
    ['information-theory', 'Information Theory', ['cs.binary.bits', 'math.algebra.logarithms'], 'Measure information content and the limits of compression and communication'],
    ['coding-theory', 'Coding Theory', ['information-theory'], 'Detect and correct errors in data transmission with redundancy codes'],
    ['automata', 'Automata Theory', ['cs.compilers.grammars', 'math.discrete.sets'], 'Study abstract machines that define what can and cannot be computed'],
    ['turing-machines', 'Turing Machines', ['automata'], 'Understand the theoretical model that defines the limits of computation'],
    ['computability', 'Computability', ['turing-machines'], 'Determine which problems can be solved by any algorithm in principle'],
    ['complexity-classes', 'Complexity Classes', ['cs.adv-algorithms.np-intro', 'turing-machines'], 'Classify problems by the resources needed to solve them — P, NP, PSPACE'],
    ['lambda-calculus', 'Lambda Calculus', ['cs.functional.pure-functions'], 'Explore the formal system that underpins all functional programming'],
    ['database-theory', 'Database Theory', ['cs.databases.normalization', 'math.discrete.sets'], 'Study relational algebra and the mathematical foundations of databases'],
    ['hci', 'Human-Computer Interaction', ['cs.oop.basics'], 'Design interfaces that are intuitive, efficient, and accessible for humans'],
    ['ux-research', 'UX Research', ['hci'], 'Conduct user research to understand needs and validate design decisions'],
    ['usability-testing', 'Usability Testing', ['hci'], 'Observe real users interacting with a system to discover usability issues'],
    ['accessibility-eng', 'Accessibility Engineering', ['hci', 'cs.web.accessibility'], 'Build inclusive software that works for people of all abilities'],
    ['embedded-intro', 'Embedded Systems Introduction', ['cs.comp-arch.cpu-design', 'cs.prog.for-loops'], 'Program resource-constrained microcontrollers for dedicated tasks'],
    ['iot-intro', 'IoT Introduction', ['embedded-intro', 'cs.networking.basics'], 'Connect everyday devices to the internet for monitoring and control'],
    ['edge-computing', 'Edge Computing', ['iot-intro', 'cs.cloud.intro'], 'Process data near its source for low latency instead of in a central cloud'],
    ['ar-vr-intro', 'AR/VR Introduction', ['cs.graphics.rendering-pipeline'], 'Create augmented and virtual reality experiences with 3D rendering and tracking'],
    ['robotics-software', 'Robotics Software', ['embedded-intro', 'cs.ml.reinforcement'], 'Write software that perceives the environment and controls robot actuators'],
    ['bioinformatics', 'Bioinformatics Introduction', ['cs.algorithms.dynamic-programming', 'cs.strings'], 'Apply algorithms to analyse biological data like DNA sequences'],
    ['scientific-computing', 'Scientific Computing', ['math.calculus', 'math.linear-algebra', 'cs.arrays'], 'Solve numerical problems in science and engineering with computers'],
    ['open-source-dev', 'Open Source Development', ['cs.vcs.collaboration', 'cs.software-eng.code-review'], 'Contribute to open source projects and build collaborative communities'],
  ]),
];

// ===========================================================================
// ENGINEERING — FOUNDATION  (~30 skills)
// Ages 2–5: Building blocks, balance, ramps, towers, bridges, tools, design
// ===========================================================================

const engFoundation: SkillNode[] = [

  // ---- Preserved entry-point skills ----
  skill('engineering.basics', 'Engineering Basics', ENG, 'foundation',
    ['math.shapes'],
    'Explore how things are built and why some structures stand while others fall', [WS, AD]),
  skill('engineering.building-blocks', 'Building Blocks', ENG, 'foundation',
    ['engineering.basics', 'math.shapes.3d'],
    'Stack, connect, and arrange 3D blocks to create stable structures', [WS, AD]),

  // ---- Building & construction (10) ----
  ...topic('engineering.build', ENG, 'foundation', [WS, AD], [
    ['stacking', 'Stacking', ['engineering.building-blocks'], 'Stack objects to discover balance and centre of gravity'],
    ['towers', 'Building Towers', ['stacking'], 'Build the tallest tower that stays standing using different materials'],
    ['bridges-intro', 'Bridge Building Introduction', ['stacking'], 'Span a gap with a simple beam bridge made from everyday materials'],
    ['walls', 'Building Walls', ['stacking'], 'Create strong walls by overlapping blocks like real brickwork'],
    ['enclosures', 'Enclosures', ['walls'], 'Build closed structures with walls, a floor, and a roof'],
    ['ramps', 'Ramps & Slopes', ['engineering.basics'], 'Roll objects down ramps to explore height, angle, and speed'],
    ['balance', 'Balance & Stability', ['engineering.basics'], 'Discover why wide bases and low centres make structures stable'],
    ['symmetry', 'Structural Symmetry', ['balance', 'math.shapes'], 'Build symmetrical structures that distribute weight evenly'],
    ['joining', 'Joining Materials', ['engineering.basics'], 'Connect pieces using tape, glue, clips, and interlocking shapes'],
    ['planning-builds', 'Planning Builds', ['engineering.basics'], 'Draw a simple plan before building to think about what you need'],
  ]),

  // ---- Tools & materials (8) ----
  ...topic('engineering.tools', ENG, 'foundation', [WS], [
    ['ruler', 'Using a Ruler', ['math.measurement.length'], 'Measure lengths with a ruler to cut and build accurately'],
    ['scissors', 'Cutting Safely', ['engineering.basics'], 'Use scissors to cut paper, card, and soft materials safely'],
    ['tape-glue', 'Tape and Glue', ['scissors'], 'Choose the right adhesive and apply it neatly to join materials'],
    ['materials-explore', 'Exploring Materials', ['engineering.basics'], 'Compare paper, card, wood, fabric, and plastic for building projects'],
    ['strong-weak', 'Strong and Weak', ['materials-explore'], 'Test which materials are strongest by pushing, pulling, and bending'],
    ['waterproof', 'Waterproof Testing', ['materials-explore'], 'Test which materials keep water out for weather-proof designs'],
    ['recycled', 'Recycled Materials', ['materials-explore'], 'Build with recycled materials to learn resourcefulness and sustainability'],
    ['tools-safety', 'Tool Safety', ['engineering.basics'], 'Handle tools safely and return them to their proper places'],
  ]),

  // ---- Design thinking for kids (10) ----
  ...topic('engineering.design-kids', ENG, 'foundation', [WS, AD], [
    ['imagine', 'Imagine', ['engineering.basics'], 'Start every project by imagining what you want to create'],
    ['draw-plan', 'Draw a Plan', ['imagine'], 'Sketch your idea on paper before you start building'],
    ['build-it', 'Build It', ['draw-plan'], 'Follow your plan to build a first version of your creation'],
    ['test-it', 'Test It', ['build-it'], 'Try out your creation to see if it works the way you imagined'],
    ['improve', 'Improve It', ['test-it'], 'Change your design based on what you learned from testing'],
    ['share', 'Share Your Creation', ['improve'], 'Show your creation to others and explain how it works'],
    ['ask-questions', 'Asking Questions', ['engineering.basics'], 'Ask "what if" and "how might we" to spark engineering ideas'],
    ['observe', 'Observing Problems', ['ask-questions'], 'Notice real-world problems that engineering could solve'],
    ['teamwork', 'Teamwork', ['engineering.basics'], 'Work together to build something bigger than one person could'],
    ['persistence', 'Persistence', ['test-it'], 'Keep trying different approaches when your first design does not work'],
  ]),
];

// ===========================================================================
// ENGINEERING — DISCOVERY  (~80 skills)
// Grades K–2: Design process, materials, measurement, simple machines,
// structural basics, electricity basics, mechanical advantage
// ===========================================================================

const engDiscovery: SkillNode[] = [

  // ---- Preserved skills ----
  skill('engineering.simple-machines.intro', 'Simple Machines Introduction', ENG, 'discovery',
    ['science.physics.forces'],
    'Identify the six simple machines that make work easier', [WS, AD]),
  skill('engineering.design-process', 'Design Process', ENG, 'discovery',
    ['engineering.basics', 'cs.decomposition'],
    'Follow a structured cycle of define, ideate, prototype, test, and refine', [WS, AD]),
  skill('engineering.measurement', 'Measurement', ENG, 'discovery',
    ['math.measurement.length', 'math.measurement.weight'],
    'Measure length, weight, and capacity accurately for engineering projects', [WS]),
  skill('engineering.materials', 'Materials Science Basics', ENG, 'discovery',
    ['science.matter', 'engineering.basics'],
    'Classify materials by their properties: strength, flexibility, conductivity', [WS]),

  // ---- Simple machines in depth (18) ----
  ...topic('engineering.simple-machines', ENG, 'discovery', [WS, AD], [
    ['lever', 'Levers', ['intro'], 'Use a rigid bar and fulcrum to multiply force or increase reach'],
    ['lever-classes', 'Lever Classes', ['lever'], 'Identify first, second, and third class levers in everyday tools'],
    ['lever-balance', 'Lever Balance', ['lever', 'engineering.measurement'], 'Balance a lever by adjusting load distance from the fulcrum'],
    ['wheel-axle', 'Wheel and Axle', ['intro'], 'Reduce friction and multiply force by turning a wheel around an axle'],
    ['pulley', 'Pulleys', ['intro'], 'Lift heavy loads with less effort by redirecting force through a rope and wheel'],
    ['pulley-systems', 'Pulley Systems', ['pulley'], 'Combine multiple pulleys to multiply lifting force even further'],
    ['inclined-plane', 'Inclined Planes', ['intro'], 'Spread the effort of lifting over a longer, gentler slope'],
    ['wedge', 'Wedges', ['inclined-plane'], 'Split materials apart by converting motion into a spreading force'],
    ['screw', 'Screws', ['inclined-plane'], 'Convert rotational motion into linear motion with a spiral inclined plane'],
    ['mechanical-advantage', 'Mechanical Advantage', ['lever', 'pulley'], 'Calculate how much a simple machine multiplies your input force'],
    ['compound-machines', 'Compound Machines', ['mechanical-advantage'], 'Combine two or more simple machines to accomplish complex tasks'],
    ['gear-intro', 'Gears Introduction', ['wheel-axle'], 'Transfer motion between interlocking toothed wheels'],
    ['gear-ratios', 'Gear Ratios', ['gear-intro', 'math.ratios'], 'Calculate speed and torque trade-offs from gear size ratios'],
    ['gear-trains', 'Gear Trains', ['gear-ratios'], 'Chain multiple gears to achieve large speed or torque changes'],
    ['belt-drives', 'Belt Drives', ['wheel-axle'], 'Transmit motion between distant shafts using belts and pulleys'],
    ['friction-intro', 'Friction in Machines', ['intro'], 'Understand how friction resists motion and generates heat in machines'],
    ['lubrication', 'Lubrication', ['friction-intro'], 'Reduce friction and wear with oils, greases, and other lubricants'],
    ['efficiency-machines', 'Machine Efficiency', ['mechanical-advantage', 'friction-intro'], 'Calculate useful output versus total input to measure efficiency'],
  ]),

  // ---- Design process extended (10) ----
  ...topic('engineering.design-ext', ENG, 'discovery', [WS, AD], [
    ['define-problem', 'Defining Problems', ['engineering.design-process'], 'State exactly what problem needs solving and who it affects'],
    ['constraints', 'Constraints', ['define-problem'], 'Identify limits on time, materials, size, and cost for a project'],
    ['brainstorming', 'Brainstorming', ['define-problem'], 'Generate many ideas quickly without judging any of them'],
    ['sketching', 'Design Sketching', ['brainstorming'], 'Draw labelled sketches showing how a design works'],
    ['prototyping', 'Prototyping', ['sketching'], 'Build a quick, rough version of your design to test key ideas'],
    ['testing-designs', 'Testing Designs', ['prototyping'], 'Run fair tests to see if a prototype meets the requirements'],
    ['iterating', 'Iterating', ['testing-designs'], 'Improve a design through multiple rounds of testing and refinement'],
    ['trade-offs', 'Trade-Offs', ['constraints'], 'Weigh competing goals to choose the best overall design'],
    ['documenting', 'Documenting Designs', ['engineering.design-process'], 'Record what you built, how it works, and what you learned'],
    ['presenting', 'Presenting Solutions', ['documenting'], 'Explain your design clearly with diagrams and demonstrations'],
  ]),

  // ---- Materials science expanded (10) ----
  ...topic('engineering.materials-ext', ENG, 'discovery', [WS], [
    ['properties', 'Material Properties', ['engineering.materials'], 'Test hardness, elasticity, brittleness, and tensile strength'],
    ['wood', 'Wood', ['engineering.materials'], 'Understand the properties and uses of different types of wood'],
    ['metal-intro', 'Metals Introduction', ['engineering.materials'], 'Explore metals as strong, conductive, and malleable building materials'],
    ['plastic-intro', 'Plastics Introduction', ['engineering.materials'], 'Learn about different plastics and their versatile engineering uses'],
    ['fabric-textiles', 'Fabrics & Textiles', ['engineering.materials'], 'Use woven and non-woven materials for flexible engineering solutions'],
    ['composites-intro', 'Composites Introduction', ['properties'], 'Combine materials to get the best properties of each'],
    ['material-selection', 'Material Selection', ['properties'], 'Choose the right material for a project based on its requirements'],
    ['recycling', 'Material Recycling', ['engineering.materials'], 'Understand how materials can be recycled and reused in engineering'],
    ['sustainability', 'Sustainable Materials', ['recycling'], 'Choose materials with lower environmental impact for greener designs'],
    ['material-testing', 'Material Testing', ['properties', 'engineering.measurement'], 'Conduct simple tests to compare material strength and flexibility'],
  ]),

  // ---- Measurement & precision (8) ----
  ...topic('engineering.precision', ENG, 'discovery', [WS], [
    ['units', 'Units of Measurement', ['engineering.measurement'], 'Use centimetres, metres, grams, and litres correctly'],
    ['conversion', 'Unit Conversion', ['units'], 'Convert between related units within the metric system'],
    ['accuracy', 'Measurement Accuracy', ['units'], 'Take measurements carefully to minimise errors'],
    ['tools-measuring', 'Measuring Tools', ['engineering.measurement'], 'Use rulers, tape measures, scales, and measuring cups'],
    ['angles', 'Measuring Angles', ['tools-measuring', 'math.geometry'], 'Use a protractor to measure and draw precise angles'],
    ['area-volume', 'Area and Volume', ['units', 'math.geometry.area'], 'Calculate the area and volume of simple shapes for building projects'],
    ['scale-drawings', 'Scale Drawings', ['tools-measuring', 'math.ratios'], 'Draw objects smaller or larger than real life using a consistent scale'],
    ['tolerances', 'Tolerances', ['accuracy'], 'Understand that all measurements have an acceptable range of error'],
  ]),

  // ---- Structural basics (12) ----
  ...topic('engineering.struct-basics', ENG, 'discovery', [AD, WS], [
    ['load-types', 'Types of Loads', ['engineering.basics', 'science.physics.forces'], 'Identify dead loads, live loads, and dynamic loads on a structure'],
    ['tension-compression', 'Tension and Compression', ['load-types'], 'Feel the difference between pulling forces and pushing forces in a material'],
    ['beams', 'Beams', ['tension-compression'], 'Understand how horizontal beams support loads between supports'],
    ['columns', 'Columns', ['tension-compression'], 'Understand how vertical columns carry loads down to the ground'],
    ['trusses-intro', 'Trusses Introduction', ['beams', 'math.geometry.triangles'], 'Build triangle-based frameworks that are strong and lightweight'],
    ['arches', 'Arches', ['tension-compression'], 'Discover how curved structures redirect loads around an opening'],
    ['foundations', 'Foundations', ['columns'], 'Understand why strong foundations spread loads into the ground'],
    ['triangulation', 'Triangulation', ['trusses-intro'], 'Add diagonal bracing to make rectangular frames rigid'],
    ['cantilevers', 'Cantilevers', ['beams'], 'Build beams that extend unsupported from one end like a diving board'],
    ['cable-structures', 'Cable Structures', ['tension-compression'], 'Use cables in tension to support bridges and roofs'],
    ['load-path', 'Load Path', ['load-types'], 'Trace how forces travel through a structure from load to ground'],
    ['structural-failure', 'Structural Failure', ['load-path'], 'Analyse why structures fail and how to prevent it'],
  ]),

  // ---- Electricity basics (10) ----
  ...topic('engineering.electricity', ENG, 'discovery', [WS], [
    ['circuits-intro', 'Simple Circuits', ['science.physics.circuits'], 'Build a circuit with a battery, wire, and light bulb'],
    ['series', 'Series Circuits', ['circuits-intro'], 'Connect components one after another in a single loop'],
    ['parallel', 'Parallel Circuits', ['circuits-intro'], 'Connect components side by side so each has its own path'],
    ['switches', 'Switches', ['circuits-intro'], 'Add switches to control when current flows through a circuit'],
    ['leds', 'LEDs', ['circuits-intro'], 'Use light-emitting diodes that glow when current flows the right way'],
    ['resistors-intro', 'Resistors Introduction', ['circuits-intro'], 'Limit current flow with resistors to protect components'],
    ['batteries', 'Batteries & Power', ['circuits-intro'], 'Understand voltage, current, and how batteries supply energy'],
    ['conductors-insulators', 'Conductors & Insulators', ['circuits-intro', 'engineering.materials'], 'Test which materials allow electricity to flow and which block it'],
    ['circuit-diagrams', 'Circuit Diagrams', ['circuits-intro'], 'Draw standard symbols to represent circuit components on paper'],
    ['motors-intro', 'Motors Introduction', ['circuits-intro'], 'Connect a motor to a circuit and watch electrical energy become motion'],
  ]),

  // ---- Additional discovery skills (8) ----
  ...topic('engineering.motion', ENG, 'discovery', [WS, AD], [
    ['wheels', 'Wheels in Engineering', ['engineering.simple-machines.wheel-axle'], 'Explore how wheels reduce friction and enable vehicles'],
    ['axles', 'Axles', ['wheels'], 'Connect wheels to frames with axles for smooth rolling motion'],
    ['vehicle-basics', 'Vehicle Basics', ['wheels', 'axles'], 'Build simple wheeled vehicles powered by gravity, rubber bands, or motors'],
    ['propellers', 'Propellers', ['engineering.simple-machines.wheel-axle'], 'Spin blades to push air or water and generate thrust'],
    ['wind-powered', 'Wind-Powered Machines', ['propellers'], 'Build windmills and wind-powered vehicles that harness moving air'],
    ['water-powered', 'Water-Powered Machines', ['engineering.simple-machines.wheel-axle'], 'Build water wheels that convert flowing water into useful motion'],
    ['catapults', 'Catapults', ['engineering.simple-machines.lever'], 'Build lever-based launchers to explore stored energy and projectile motion'],
    ['automata', 'Automata', ['engineering.simple-machines.compound-machines'], 'Build mechanical toys with cams, gears, and cranks that move on their own'],
  ]),
];

// ===========================================================================
// ENGINEERING — BUILDER  (~130 skills)
// Structural, electrical, mechanical engineering, CAD, manufacturing, robotics
// ===========================================================================

const engBuilder: SkillNode[] = [

  // ---- Preserved structural skills ----
  skill('engineering.structures', 'Structural Engineering', ENG, 'builder',
    ['math.geometry', 'science.physics.forces'],
    'Analyse and design structures that safely carry loads to the ground', [AD, WS]),
  skill('engineering.structures.bridges', 'Bridge Engineering', ENG, 'builder',
    ['engineering.structures', 'math.geometry.triangles'],
    'Design beam, truss, arch, suspension, and cable-stayed bridges', [AD]),
  skill('engineering.structures.buildings', 'Building Engineering', ENG, 'builder',
    ['engineering.structures', 'math.geometry.area'],
    'Engineer multi-storey buildings with frames, floors, and lateral bracing', [AD]),

  // ---- Preserved circuit skills ----
  skill('engineering.circuits', 'Circuit Analysis', ENG, 'builder',
    ['math.algebra', 'science.physics.circuits'],
    'Analyse circuits using Ohm\'s law, Kirchhoff\'s laws, and nodal analysis', [WS]),
  skill('engineering.circuits.digital', 'Digital Circuits', ENG, 'builder',
    ['engineering.circuits', 'math.discrete.logic'],
    'Build logic circuits with gates, flip-flops, and combinational logic', [WS]),

  // ---- Preserved mechanism & robotics skills ----
  skill('engineering.mechanisms', 'Mechanisms', ENG, 'builder',
    ['science.physics.simple-machines', 'math.ratios'],
    'Design linkages, cams, gears, and cranks that convert one type of motion to another', [WS]),
  skill('engineering.robotics.basics', 'Robotics Basics', ENG, 'builder',
    ['engineering.circuits', 'cs.functions'],
    'Build simple robots with sensors, actuators, and programmed behaviour', [WS, SY]),

  // ---- Structural engineering extended (18) ----
  ...topic('engineering.struct', ENG, 'builder', [AD, WS], [
    ['beam-types', 'Beam Types', ['engineering.structures'], 'Compare simply supported, cantilever, continuous, and fixed beams'],
    ['truss-analysis', 'Truss Analysis', ['engineering.structures', 'math.trig.basics'], 'Calculate forces in truss members using the method of joints'],
    ['truss-types', 'Truss Types', ['truss-analysis'], 'Identify Pratt, Warren, Howe, and other common truss configurations'],
    ['arch-analysis', 'Arch Analysis', ['engineering.structures'], 'Understand how arches transfer loads through compression'],
    ['frame-analysis', 'Frame Analysis', ['beam-types'], 'Analyse rigid frames with fixed joints that resist rotation'],
    ['load-calculation', 'Load Calculations', ['engineering.structures'], 'Calculate dead, live, wind, and seismic loads on a structure'],
    ['material-selection-struct', 'Structural Material Selection', ['engineering.materials', 'engineering.structures'], 'Choose steel, concrete, timber, or masonry based on structural demands'],
    ['concrete-basics', 'Concrete Basics', ['material-selection-struct'], 'Understand how concrete resists compression and needs reinforcement for tension'],
    ['reinforced-concrete', 'Reinforced Concrete', ['concrete-basics'], 'Combine steel rebar with concrete for structures that handle tension and compression'],
    ['steel-structures', 'Steel Structures', ['material-selection-struct'], 'Design with structural steel sections for high strength-to-weight ratio'],
    ['timber-structures', 'Timber Structures', ['material-selection-struct'], 'Engineer with wood for sustainable, lightweight structural systems'],
    ['foundation-types', 'Foundation Types', ['engineering.structures'], 'Choose shallow or deep foundations based on soil conditions and loads'],
    ['retaining-walls', 'Retaining Walls', ['foundation-types'], 'Design walls that hold back soil on slopes and excavations'],
    ['bridge-types', 'Bridge Type Selection', ['engineering.structures.bridges'], 'Choose the right bridge type for a given span, load, and site'],
    ['suspension-bridges', 'Suspension Bridges', ['engineering.structures.bridges'], 'Design long-span bridges suspended from cables draped between towers'],
    ['building-frames', 'Building Frames', ['engineering.structures.buildings'], 'Design the skeleton of a building using beams and columns'],
    ['lateral-systems', 'Lateral Load Systems', ['building-frames'], 'Brace buildings against wind and earthquakes with shear walls and braced frames'],
    ['roof-structures', 'Roof Structures', ['beam-types'], 'Design roof trusses, rafters, and purlins to span and protect buildings'],
  ]),

  // ---- Electrical engineering (18) ----
  ...topic('engineering.ee', ENG, 'builder', [WS], [
    ['ohms-law', 'Ohm\'s Law', ['engineering.circuits'], 'Calculate voltage, current, and resistance with V = IR'],
    ['kirchhoff-voltage', 'Kirchhoff\'s Voltage Law', ['ohms-law'], 'Voltages around any closed loop sum to zero'],
    ['kirchhoff-current', 'Kirchhoff\'s Current Law', ['ohms-law'], 'Currents entering a node equal currents leaving it'],
    ['series-parallel', 'Series-Parallel Circuits', ['kirchhoff-voltage', 'kirchhoff-current'], 'Reduce complex circuits by combining series and parallel resistors'],
    ['capacitors', 'Capacitors', ['engineering.circuits'], 'Store and release electrical energy in an electric field'],
    ['inductors', 'Inductors', ['engineering.circuits'], 'Store energy in a magnetic field created by current flowing through a coil'],
    ['rc-circuits', 'RC Circuits', ['capacitors', 'ohms-law'], 'Analyse charging and discharging behaviour of resistor-capacitor circuits'],
    ['power-calcs', 'Power Calculations', ['ohms-law'], 'Calculate electrical power consumed and dissipated in circuits'],
    ['ac-basics', 'AC Circuits Basics', ['engineering.circuits'], 'Understand alternating current, frequency, and peak versus RMS values'],
    ['breadboarding', 'Breadboarding', ['engineering.circuits'], 'Prototype circuits quickly on a solderless breadboard'],
    ['soldering', 'Soldering', ['breadboarding'], 'Join components permanently with solder for durable circuits'],
    ['multimeter', 'Using a Multimeter', ['ohms-law'], 'Measure voltage, current, and resistance with a digital multimeter'],
    ['microcontrollers', 'Microcontrollers', ['engineering.circuits.digital', 'cs.functions'], 'Program small computers that read sensors and control outputs'],
    ['digital-logic', 'Digital Logic Design', ['engineering.circuits.digital'], 'Design combinational and sequential logic circuits from gates'],
    ['flip-flops', 'Flip-Flops', ['digital-logic'], 'Store one bit of data using SR, D, JK, or T flip-flops'],
    ['counters', 'Counters', ['flip-flops'], 'Count events or generate timing sequences with digital counter circuits'],
    ['seven-segment', 'Seven-Segment Displays', ['digital-logic'], 'Drive numeric displays using binary-coded decimal and decoder circuits'],
    ['pwm', 'Pulse Width Modulation', ['microcontrollers'], 'Control motor speed and LED brightness by varying pulse duty cycle'],
  ]),

  // ---- Mechanical engineering (18) ----
  ...topic('engineering.mech', ENG, 'builder', [WS, SY], [
    ['linkages', 'Linkages', ['engineering.mechanisms'], 'Connect rigid bars with pivots to transmit and transform motion'],
    ['four-bar', 'Four-Bar Linkages', ['linkages'], 'Analyse the most common planar linkage for complex output motion'],
    ['cams', 'Cams and Followers', ['engineering.mechanisms'], 'Convert rotational motion into prescribed follower motion with shaped cams'],
    ['gears-advanced', 'Advanced Gears', ['engineering.mechanisms', 'math.trig.basics'], 'Design spur, helical, bevel, and worm gears for different applications'],
    ['gear-design', 'Gear Design', ['gears-advanced'], 'Calculate tooth geometry, pitch, and contact ratio for smooth meshing'],
    ['bearings', 'Bearings', ['engineering.mechanisms'], 'Reduce friction and support rotating shafts with ball and roller bearings'],
    ['springs', 'Springs', ['engineering.mechanisms'], 'Use springs to store energy, absorb shock, and maintain force'],
    ['pneumatics', 'Pneumatics', ['engineering.mechanisms'], 'Use compressed air to power cylinders, grippers, and actuators'],
    ['hydraulics', 'Hydraulics', ['engineering.mechanisms', 'science.physics.pressure'], 'Use pressurised fluid to generate large forces in compact systems'],
    ['shafts', 'Shafts', ['bearings'], 'Design rotating shafts to transmit torque from motors to mechanisms'],
    ['couplings', 'Couplings', ['shafts'], 'Connect two shafts together allowing for misalignment'],
    ['brakes-clutches', 'Brakes and Clutches', ['shafts'], 'Control and stop rotational motion with friction-based devices'],
    ['power-transmission', 'Power Transmission', ['gears-advanced', 'shafts'], 'Deliver mechanical power from source to load through shafts and gears'],
    ['vibration-intro', 'Vibration Introduction', ['springs', 'math.equations'], 'Understand oscillatory motion in machines and how to control it'],
    ['tolerancing', 'Tolerancing', ['engineering.measurement'], 'Specify allowable dimensional variation for interchangeable parts'],
    ['fasteners', 'Fasteners', ['engineering.mechanisms'], 'Select bolts, nuts, screws, and rivets for mechanical assemblies'],
    ['seals-gaskets', 'Seals and Gaskets', ['engineering.mechanisms'], 'Prevent fluid leaks at joints and interfaces in mechanical systems'],
    ['maintenance', 'Maintenance Engineering', ['engineering.mechanisms'], 'Plan preventive and predictive maintenance to keep machines running'],
  ]),

  // ---- CAD basics (10) ----
  ...topic('engineering.cad', ENG, 'builder', [WS, AD], [
    ['drafting-intro', '2D Drafting Introduction', ['engineering.measurement'], 'Create precise two-dimensional technical drawings on a computer'],
    ['drawing-views', 'Drawing Views', ['drafting-intro'], 'Show front, side, and top views of an object with correct projection'],
    ['dimensioning', 'Dimensioning', ['drawing-views'], 'Add measurements and tolerances to technical drawings clearly'],
    ['sections', 'Section Views', ['drawing-views'], 'Cut through an object to reveal internal features in a drawing'],
    ['3d-modeling-intro', '3D Modelling Introduction', ['drafting-intro'], 'Create three-dimensional digital models of parts and assemblies'],
    ['extrude-revolve', 'Extrude and Revolve', ['3d-modeling-intro'], 'Build 3D shapes by pushing 2D profiles or spinning them around an axis'],
    ['boolean-ops', 'Boolean Operations', ['3d-modeling-intro'], 'Combine, subtract, and intersect 3D shapes to create complex forms'],
    ['assemblies', 'Assembly Modelling', ['3d-modeling-intro'], 'Put multiple parts together in a digital assembly with constraints'],
    ['parametric', 'Parametric Modelling', ['3d-modeling-intro'], 'Drive model dimensions with parameters so changes propagate automatically'],
    ['rendering-cad', 'CAD Rendering', ['3d-modeling-intro'], 'Apply materials and lighting to create realistic images of designs'],
  ]),

  // ---- Manufacturing (10) ----
  ...topic('engineering.manufacturing', ENG, 'builder', [WS], [
    ['3d-printing', '3D Printing', ['engineering.cad.3d-modeling-intro'], 'Build parts layer by layer from a digital model'],
    ['fdm', 'FDM Printing', ['3d-printing'], 'Print with melted plastic filament for rapid prototyping'],
    ['sla', 'SLA Printing', ['3d-printing'], 'Print with UV-cured resin for high-detail parts'],
    ['laser-cutting', 'Laser Cutting', ['engineering.cad.drafting-intro'], 'Cut flat materials precisely using a computer-controlled laser'],
    ['cnc-intro', 'CNC Introduction', ['engineering.cad.3d-modeling-intro'], 'Remove material with computer-controlled milling and turning machines'],
    ['subtractive', 'Subtractive Manufacturing', ['cnc-intro'], 'Shape parts by removing material through cutting, drilling, and milling'],
    ['additive-vs-subtractive', 'Additive vs Subtractive', ['3d-printing', 'subtractive'], 'Compare building up layers versus removing material for different use cases'],
    ['sheet-metal', 'Sheet Metal Working', ['laser-cutting'], 'Cut, bend, and form flat metal sheets into three-dimensional parts'],
    ['casting-intro', 'Casting Introduction', ['engineering.materials'], 'Pour molten material into moulds to create complex shapes'],
    ['quality-control', 'Quality Control', ['engineering.measurement'], 'Inspect parts against specifications to ensure they meet standards'],
  ]),

  // ---- Robotics builder (12) ----
  ...topic('engineering.robot', ENG, 'builder', [WS, SY], [
    ['sensors', 'Robot Sensors', ['engineering.robotics.basics'], 'Read the environment with distance, light, touch, and colour sensors'],
    ['actuators', 'Robot Actuators', ['engineering.robotics.basics'], 'Move robot parts with motors, servos, and solenoids'],
    ['motor-control', 'Motor Control', ['actuators', 'engineering.ee.pwm'], 'Control motor speed and direction with H-bridges and PWM signals'],
    ['line-following', 'Line Following', ['sensors', 'motor-control'], 'Program a robot to follow a line on the ground using light sensors'],
    ['obstacle-avoid', 'Obstacle Avoidance', ['sensors', 'motor-control'], 'Program a robot to detect and steer around obstacles'],
    ['gripper', 'Grippers', ['actuators'], 'Design and control mechanical grippers to pick up objects'],
    ['robot-chassis', 'Chassis Design', ['engineering.robotics.basics'], 'Build a sturdy mobile platform with wheels, motors, and structure'],
    ['power-systems', 'Robot Power Systems', ['engineering.robotics.basics'], 'Size batteries and manage power distribution for mobile robots'],
    ['serial-comm', 'Serial Communication', ['engineering.ee.microcontrollers'], 'Connect microcontrollers to sensors and computers over serial protocols'],
    ['autonomous-basic', 'Basic Autonomy', ['line-following', 'obstacle-avoid'], 'Combine sensing and acting for simple autonomous robot behaviour'],
    ['remote-control', 'Remote Control', ['serial-comm'], 'Control a robot wirelessly from a remote device'],
    ['robot-competition', 'Robot Competition', ['autonomous-basic'], 'Design and optimise a robot for a competitive challenge'],
  ]),

  // ---- Structural testing & analysis (8) ----
  ...topic('engineering.struct-test', ENG, 'builder', [AD, WS], [
    ['load-testing', 'Load Testing', ['engineering.structures'], 'Apply increasing loads to a structure and record how it responds'],
    ['deflection-measurement', 'Deflection Measurement', ['load-testing'], 'Measure how much a beam or bridge bends under load'],
    ['failure-modes', 'Failure Modes', ['load-testing'], 'Identify whether a structure fails by bending, buckling, or shearing'],
    ['safety-factors', 'Safety Factors', ['failure-modes'], 'Design structures stronger than required to account for uncertainty'],
    ['wind-loads', 'Wind Loads', ['engineering.structures'], 'Calculate the force that wind exerts on buildings and structures'],
    ['earthquake-intro', 'Earthquake Introduction', ['engineering.structures'], 'Understand how seismic waves shake structures and cause damage'],
    ['model-testing', 'Scale Model Testing', ['engineering.structures', 'engineering.precision.scale-drawings'], 'Build and test scale models to predict full-size structural behaviour'],
    ['bridge-testing', 'Bridge Load Testing', ['engineering.structures.bridges', 'load-testing'], 'Test bridge models to failure and analyse the results'],
  ]),

  // ---- Electrical projects (8) ----
  ...topic('engineering.ee-projects', ENG, 'builder', [WS], [
    ['alarm-circuit', 'Alarm Circuit', ['engineering.ee.kirchhoff-current'], 'Build a circuit that sounds an alarm when a sensor is triggered'],
    ['traffic-light', 'Traffic Light Controller', ['engineering.ee.microcontrollers'], 'Program a microcontroller to cycle through traffic light sequences'],
    ['temperature-sensor', 'Temperature Sensor Project', ['engineering.ee.microcontrollers'], 'Read a temperature sensor and display the value on a screen'],
    ['light-sensor', 'Light Sensor Project', ['engineering.ee.microcontrollers'], 'Measure ambient light and trigger actions based on brightness'],
    ['motor-project', 'Motor Control Project', ['engineering.ee.pwm'], 'Build a circuit that controls motor speed with a potentiometer'],
    ['led-matrix', 'LED Matrix', ['engineering.ee.digital-logic'], 'Drive a grid of LEDs to display patterns and scrolling text'],
    ['audio-amplifier', 'Audio Amplifier', ['engineering.ee.series-parallel'], 'Build a simple audio amplifier circuit from transistors'],
    ['wireless-project', 'Wireless Communication Project', ['engineering.robot.serial-comm'], 'Send data wirelessly between two microcontrollers'],
  ]),

  // ---- Mechanical projects (8) ----
  ...topic('engineering.mech-projects', ENG, 'builder', [WS, SY], [
    ['gear-box', 'Gear Box Design', ['engineering.mech.gears-advanced'], 'Design a gear box that changes speed and torque for a specific application'],
    ['cam-mechanism', 'Cam Mechanism Project', ['engineering.mech.cams'], 'Build a cam mechanism that converts rotation into a specific output motion'],
    ['linkage-project', 'Linkage Project', ['engineering.mech.four-bar'], 'Design and build a four-bar linkage for a specific path output'],
    ['pneumatic-arm', 'Pneumatic Arm', ['engineering.mech.pneumatics'], 'Build a robotic arm powered by syringes acting as pneumatic cylinders'],
    ['hydraulic-press', 'Hydraulic Press', ['engineering.mech.hydraulics'], 'Build a model hydraulic press to demonstrate Pascal principle'],
    ['spring-launcher', 'Spring Launcher', ['engineering.mech.springs'], 'Design a spring-powered launcher and predict projectile distance'],
    ['clock-mechanism', 'Clock Mechanism', ['engineering.mech.gears-advanced'], 'Build a working clock mechanism from gears and an escapement'],
    ['wind-turbine', 'Wind Turbine Project', ['engineering.mech.power-transmission'], 'Design and test a small wind turbine to generate electricity'],
  ]),

  // ---- Engineering drawing & documentation (6) ----
  ...topic('engineering.documentation', ENG, 'builder', [WS, AD], [
    ['technical-drawing', 'Technical Drawing', ['engineering.cad.drafting-intro'], 'Create precise engineering drawings following standard conventions'],
    ['bill-of-materials', 'Bill of Materials', ['engineering.cad.assemblies'], 'List every part, material, and quantity needed to build a design'],
    ['assembly-instructions', 'Assembly Instructions', ['bill-of-materials'], 'Write step-by-step assembly instructions with clear diagrams'],
    ['design-report', 'Design Report', ['engineering.design-process'], 'Document the full engineering design process from problem to solution'],
    ['engineering-notebook', 'Engineering Notebook', ['engineering.design-process'], 'Keep a dated record of ideas, calculations, tests, and decisions'],
    ['presentation-skills', 'Presentation Skills', ['design-report'], 'Present engineering solutions clearly to technical and non-technical audiences'],
  ]),
];

// ===========================================================================
// ENGINEERING — INNOVATOR  (~140 skills)
// Statics, dynamics, thermo, fluids, control, electronics, materials, aerospace
// ===========================================================================

const engInnovator: SkillNode[] = [

  // ---- Preserved skills ----
  skill('engineering.thermodynamics', 'Thermodynamics', ENG, 'innovator',
    ['science.physics.thermodynamics', 'math.calculus'],
    'Analyse energy, heat, and work in engineering systems', [WS, SY]),
  skill('engineering.statics', 'Statics', ENG, 'innovator',
    ['science.physics.forces', 'math.trig.basics'],
    'Analyse forces and moments on bodies in equilibrium', [AD, WS]),
  skill('engineering.dynamics', 'Dynamics', ENG, 'innovator',
    ['engineering.statics', 'math.calculus.derivatives'],
    'Analyse motion, acceleration, and the forces that cause them', [AD, WS]),
  skill('engineering.fluid-mechanics', 'Fluid Mechanics', ENG, 'innovator',
    ['science.physics.fluid-dynamics', 'math.calculus'],
    'Analyse the behaviour of liquids and gases at rest and in motion', [WS, SY]),
  skill('engineering.control-systems', 'Control Systems', ENG, 'innovator',
    ['math.calculus.differential-equations', 'engineering.circuits'],
    'Design feedback systems that maintain desired output despite disturbances', [WS, SY]),

  // ---- Statics extended (15) ----
  ...topic('engineering.statics-ext', ENG, 'innovator', [AD, WS], [
    ['free-body', 'Free-Body Diagrams', ['engineering.statics'], 'Isolate a body and draw all external forces acting on it'],
    ['equilibrium-2d', '2D Equilibrium', ['free-body'], 'Solve for unknown forces when the sum of forces and moments is zero in a plane'],
    ['equilibrium-3d', '3D Equilibrium', ['equilibrium-2d'], 'Extend equilibrium analysis to three-dimensional force systems'],
    ['moments', 'Moments and Couples', ['free-body'], 'Calculate the turning effect of forces about a point or axis'],
    ['distributed-loads', 'Distributed Loads', ['moments'], 'Replace a distributed load with an equivalent point load for analysis'],
    ['centroids', 'Centroids', ['moments', 'math.calculus.integrals'], 'Find the geometric centre of areas and volumes for load calculations'],
    ['moment-of-inertia', 'Moment of Inertia', ['centroids'], 'Calculate resistance to bending and rotation from cross-section geometry'],
    ['truss-method-joints', 'Method of Joints', ['equilibrium-2d', 'engineering.struct.truss-analysis'], 'Solve truss member forces by applying equilibrium at each joint'],
    ['truss-method-sections', 'Method of Sections', ['truss-method-joints'], 'Cut through a truss and solve for forces in selected members directly'],
    ['friction-statics', 'Friction in Statics', ['equilibrium-2d'], 'Analyse the role of static and kinetic friction in equilibrium problems'],
    ['wedge-friction', 'Wedge Analysis', ['friction-statics'], 'Determine forces needed to drive or hold a wedge in place'],
    ['belt-friction', 'Belt Friction', ['friction-statics'], 'Calculate tension differences in belts wrapped around pulleys'],
    ['shear-moment', 'Shear and Moment Diagrams', ['distributed-loads'], 'Draw internal shear force and bending moment along a beam'],
    ['beam-deflection', 'Beam Deflection', ['shear-moment', 'math.calculus.integrals'], 'Calculate how much a beam bends under load using integration methods'],
    ['stress-strain-intro', 'Stress and Strain Introduction', ['engineering.statics'], 'Relate internal forces to deformation in structural members'],
  ]),

  // ---- Dynamics extended (12) ----
  ...topic('engineering.dynamics-ext', ENG, 'innovator', [AD, WS], [
    ['kinematics-particle', 'Particle Kinematics', ['engineering.dynamics'], 'Describe position, velocity, and acceleration of a point in space'],
    ['kinetics-particle', 'Particle Kinetics', ['kinematics-particle'], 'Apply Newton\'s second law to predict a particle motion under forces'],
    ['work-energy', 'Work-Energy Method', ['kinetics-particle'], 'Solve motion problems using work done equals change in kinetic energy'],
    ['impulse-momentum', 'Impulse-Momentum', ['kinetics-particle'], 'Relate force applied over time to change in momentum'],
    ['collisions', 'Collisions', ['impulse-momentum'], 'Analyse elastic and inelastic collisions using conservation laws'],
    ['rigid-body-kinematics', 'Rigid Body Kinematics', ['kinematics-particle'], 'Describe rotation, translation, and general motion of rigid bodies'],
    ['rigid-body-kinetics', 'Rigid Body Kinetics', ['rigid-body-kinematics', 'engineering.statics-ext.moment-of-inertia'], 'Apply Newton\'s laws to rotating and translating rigid bodies'],
    ['vibrations-free', 'Free Vibrations', ['rigid-body-kinetics', 'math.calculus.differential-equations'], 'Analyse natural oscillations of undamped systems'],
    ['vibrations-damped', 'Damped Vibrations', ['vibrations-free'], 'Model how friction and resistance reduce oscillation amplitude over time'],
    ['vibrations-forced', 'Forced Vibrations', ['vibrations-damped'], 'Analyse system response when driven by an external periodic force'],
    ['resonance', 'Resonance', ['vibrations-forced'], 'Identify when driving frequency matches natural frequency causing large amplitudes'],
    ['mechanical-energy', 'Conservation of Mechanical Energy', ['work-energy'], 'Track the exchange between kinetic and potential energy in a system'],
  ]),

  // ---- Thermodynamics extended (12) ----
  ...topic('engineering.thermo', ENG, 'innovator', [WS, SY], [
    ['first-law', 'First Law of Thermodynamics', ['engineering.thermodynamics'], 'Energy is conserved: heat added equals work done plus internal energy change'],
    ['second-law', 'Second Law of Thermodynamics', ['first-law'], 'Heat flows naturally from hot to cold; entropy in isolated systems never decreases'],
    ['entropy', 'Entropy', ['second-law'], 'Quantify disorder and the unavailability of energy for useful work'],
    ['carnot', 'Carnot Cycle', ['second-law'], 'Define the theoretical maximum efficiency for a heat engine'],
    ['heat-engines', 'Heat Engines', ['carnot'], 'Analyse engines that convert thermal energy into mechanical work'],
    ['refrigeration', 'Refrigeration Cycles', ['carnot'], 'Reverse a heat engine to pump heat from cold to hot spaces'],
    ['ideal-gas', 'Ideal Gas Law', ['first-law'], 'Model gas behaviour with PV = nRT for engineering calculations'],
    ['heat-transfer-conduction', 'Conduction', ['engineering.thermodynamics'], 'Calculate heat flow through solid materials via molecular vibration'],
    ['heat-transfer-convection', 'Convection', ['heat-transfer-conduction'], 'Model heat transfer between a surface and a moving fluid'],
    ['heat-transfer-radiation', 'Radiation', ['heat-transfer-conduction'], 'Calculate heat exchange through electromagnetic waves'],
    ['heat-exchangers', 'Heat Exchangers', ['heat-transfer-convection'], 'Design devices that transfer heat between two fluids efficiently'],
    ['thermodynamic-efficiency', 'Thermodynamic Efficiency', ['heat-engines'], 'Calculate and improve the efficiency of real thermal systems'],
  ]),

  // ---- Fluid mechanics extended (12) ----
  ...topic('engineering.fluids', ENG, 'innovator', [WS, SY], [
    ['fluid-statics', 'Fluid Statics', ['engineering.fluid-mechanics'], 'Calculate pressure distribution in fluids at rest'],
    ['buoyancy', 'Buoyancy', ['fluid-statics'], 'Determine upward force on submerged and floating objects'],
    ['bernoulli', 'Bernoulli\'s Equation', ['engineering.fluid-mechanics'], 'Relate pressure, velocity, and height along a streamline'],
    ['continuity', 'Continuity Equation', ['bernoulli'], 'Conserve mass flow: what goes in must come out of a pipe'],
    ['viscosity', 'Viscosity', ['engineering.fluid-mechanics'], 'Measure a fluid\'s resistance to flowing and shearing'],
    ['laminar-turbulent', 'Laminar vs Turbulent Flow', ['viscosity'], 'Distinguish smooth layered flow from chaotic turbulent flow'],
    ['reynolds-number', 'Reynolds Number', ['laminar-turbulent'], 'Predict flow regime from the ratio of inertial to viscous forces'],
    ['pipe-flow', 'Pipe Flow', ['bernoulli', 'viscosity'], 'Calculate pressure drop and flow rate through pipes and ducts'],
    ['pumps', 'Pumps', ['pipe-flow'], 'Select and size pumps to move fluids through piping systems'],
    ['turbines', 'Turbines', ['bernoulli'], 'Extract energy from flowing fluid to generate mechanical power'],
    ['drag-lift', 'Drag and Lift', ['bernoulli', 'viscosity'], 'Calculate aerodynamic forces on objects moving through fluid'],
    ['open-channel', 'Open Channel Flow', ['bernoulli'], 'Analyse water flow in rivers, canals, and drainage channels'],
  ]),

  // ---- Control systems extended (12) ----
  ...topic('engineering.controls', ENG, 'innovator', [WS, SY], [
    ['open-loop', 'Open-Loop Control', ['engineering.control-systems'], 'Design control systems that act without measuring the output'],
    ['closed-loop', 'Closed-Loop Control', ['open-loop'], 'Add feedback to automatically correct errors between desired and actual output'],
    ['block-diagrams', 'Block Diagrams', ['closed-loop'], 'Represent control systems as interconnected blocks with transfer functions'],
    ['transfer-functions', 'Transfer Functions', ['block-diagrams', 'math.calculus.differential-equations'], 'Describe input-output behaviour in the Laplace domain'],
    ['pid', 'PID Controllers', ['closed-loop'], 'Tune proportional, integral, and derivative gains for stable control'],
    ['stability', 'Stability Analysis', ['transfer-functions'], 'Determine whether a system will settle, oscillate, or diverge'],
    ['root-locus', 'Root Locus', ['stability'], 'Visualise how system poles move as controller gain changes'],
    ['bode-plots', 'Bode Plots', ['transfer-functions'], 'Plot frequency response to analyse gain and phase margins'],
    ['state-space', 'State-Space Representation', ['transfer-functions'], 'Model systems with matrices of state variables for modern control'],
    ['digital-control', 'Digital Control', ['pid', 'engineering.circuits.digital'], 'Implement controllers in digital hardware with sampled signals'],
    ['sensor-integration', 'Sensor Integration', ['closed-loop', 'engineering.robot.sensors'], 'Fuse multiple sensor readings for accurate control feedback'],
    ['actuator-selection', 'Actuator Selection', ['closed-loop'], 'Choose motors, valves, and actuators to meet control system requirements'],
  ]),

  // ---- Electronics (15) ----
  ...topic('engineering.electronics', ENG, 'innovator', [WS], [
    ['op-amps', 'Operational Amplifiers', ['engineering.circuits'], 'Use op-amps to amplify, filter, and compare analogue signals'],
    ['inverting-amp', 'Inverting Amplifier', ['op-amps'], 'Build a circuit that amplifies and inverts the input signal'],
    ['non-inverting-amp', 'Non-Inverting Amplifier', ['op-amps'], 'Build a circuit that amplifies without inverting the input signal'],
    ['comparators', 'Comparators', ['op-amps'], 'Compare two voltages and output which is higher'],
    ['active-filters', 'Active Filters', ['op-amps'], 'Design low-pass, high-pass, and band-pass filters using op-amps'],
    ['diodes', 'Diodes', ['engineering.circuits'], 'Allow current to flow in one direction for rectification and protection'],
    ['transistors', 'Transistors', ['engineering.circuits'], 'Switch and amplify signals with bipolar or field-effect transistors'],
    ['mosfets', 'MOSFETs', ['transistors'], 'Use metal-oxide-semiconductor FETs for efficient switching'],
    ['adc', 'Analogue-to-Digital Conversion', ['engineering.circuits.digital', 'op-amps'], 'Convert continuous analogue signals into discrete digital values'],
    ['dac', 'Digital-to-Analogue Conversion', ['adc'], 'Convert digital values back into smooth analogue signals'],
    ['voltage-regulators', 'Voltage Regulators', ['engineering.circuits'], 'Maintain a constant output voltage regardless of load changes'],
    ['oscillators', 'Oscillators', ['op-amps', 'engineering.ee.rc-circuits'], 'Generate periodic signals for clocks, audio, and radio frequencies'],
    ['pcb-design', 'PCB Design', ['engineering.ee.soldering'], 'Layout printed circuit boards for reliable, compact electronics'],
    ['embedded-programming', 'Embedded Programming', ['engineering.ee.microcontrollers', 'cs.prog.for-loops'], 'Write low-level code that runs directly on microcontroller hardware'],
    ['communication-protocols', 'Communication Protocols', ['embedded-programming'], 'Exchange data between devices using I2C, SPI, UART, and CAN'],
  ]),

  // ---- Signal processing basics (10) ----
  ...topic('engineering.signals', ENG, 'innovator', [WS], [
    ['intro', 'Signals Introduction', ['engineering.electronics.adc', 'math.trig.basics'], 'Understand signals as time-varying quantities that carry information'],
    ['sampling', 'Sampling', ['intro'], 'Convert continuous signals to discrete samples at regular intervals'],
    ['nyquist', 'Nyquist Theorem', ['sampling'], 'Sample at least twice the highest frequency to avoid aliasing'],
    ['fourier-intro', 'Fourier Analysis Introduction', ['intro', 'math.trig.basics'], 'Decompose any signal into a sum of sinusoidal frequencies'],
    ['frequency-domain', 'Frequency Domain', ['fourier-intro'], 'Analyse signals by their frequency content instead of time behaviour'],
    ['digital-filters', 'Digital Filters', ['frequency-domain'], 'Remove noise and isolate frequency bands with software filters'],
    ['fir-filters', 'FIR Filters', ['digital-filters'], 'Design finite impulse response filters with guaranteed stability'],
    ['iir-filters', 'IIR Filters', ['digital-filters'], 'Design infinite impulse response filters for efficient recursive filtering'],
    ['modulation', 'Modulation', ['fourier-intro'], 'Encode information onto carrier waves with AM, FM, and digital modulation'],
    ['noise', 'Noise in Signals', ['intro'], 'Identify, characterise, and reduce unwanted noise in measured signals'],
  ]),

  // ---- Advanced materials science (12) ----
  ...topic('engineering.adv-materials', ENG, 'innovator', [WS], [
    ['stress-strain', 'Stress-Strain Curves', ['engineering.statics-ext.stress-strain-intro'], 'Interpret the full stress-strain relationship from elastic to failure'],
    ['youngs-modulus', 'Young\'s Modulus', ['stress-strain'], 'Measure material stiffness as the ratio of stress to strain'],
    ['yield-ultimate', 'Yield and Ultimate Strength', ['stress-strain'], 'Identify when a material starts to deform permanently and when it breaks'],
    ['poissons-ratio', 'Poisson\'s Ratio', ['stress-strain'], 'Relate lateral contraction to axial stretching of a material'],
    ['fatigue', 'Fatigue', ['stress-strain'], 'Understand how repeated loading weakens materials over many cycles'],
    ['creep', 'Creep', ['stress-strain'], 'Analyse slow deformation under sustained load at elevated temperatures'],
    ['fracture-mechanics', 'Fracture Mechanics', ['stress-strain'], 'Predict when and how cracks will grow through a material'],
    ['composites', 'Composite Materials', ['engineering.materials-ext.composites-intro'], 'Design laminates and fibre-reinforced materials for high performance'],
    ['heat-treatment', 'Heat Treatment', ['engineering.materials', 'engineering.thermodynamics'], 'Alter material properties with controlled heating and cooling cycles'],
    ['corrosion', 'Corrosion', ['engineering.materials', 'science.chemistry.reactions'], 'Understand how materials degrade from chemical reactions with their environment'],
    ['material-testing-adv', 'Advanced Material Testing', ['stress-strain'], 'Conduct tensile, compression, impact, and hardness tests to characterise materials'],
    ['smart-materials', 'Smart Materials', ['stress-strain'], 'Explore shape-memory alloys, piezoelectrics, and other responsive materials'],
  ]),

  // ---- Aerospace basics (10) ----
  ...topic('engineering.aerospace', ENG, 'innovator', [SY, AD], [
    ['intro', 'Aerospace Introduction', ['engineering.dynamics', 'engineering.fluid-mechanics'], 'Explore the engineering of aircraft and spacecraft'],
    ['four-forces', 'Four Forces of Flight', ['intro'], 'Balance lift, weight, thrust, and drag for controlled flight'],
    ['airfoils', 'Airfoils', ['engineering.fluids.drag-lift'], 'Shape wings to generate lift by creating pressure differences'],
    ['aircraft-stability', 'Aircraft Stability', ['four-forces'], 'Design aircraft that return to equilibrium after a disturbance'],
    ['propulsion-intro', 'Propulsion Introduction', ['engineering.thermo.heat-engines'], 'Generate thrust with propellers, jets, and rocket engines'],
    ['rocket-basics', 'Rocket Basics', ['propulsion-intro'], 'Apply Newton\'s third law to accelerate a vehicle by expelling mass'],
    ['orbital-mechanics', 'Orbital Mechanics Intro', ['engineering.dynamics', 'math.calculus'], 'Calculate orbits, escape velocities, and transfer trajectories'],
    ['spacecraft-systems', 'Spacecraft Systems', ['orbital-mechanics'], 'Design life support, power, and communication systems for space'],
    ['aircraft-structures', 'Aircraft Structures', ['engineering.structures', 'engineering.adv-materials.composites'], 'Design lightweight, strong structures for airframes and wings'],
    ['flight-instruments', 'Flight Instruments', ['four-forces', 'engineering.controls.closed-loop'], 'Read altimeters, airspeed indicators, and attitude instruments'],
  ]),

  // ---- Energy systems (10) ----
  ...topic('engineering.energy', ENG, 'innovator', [WS, SY], [
    ['intro', 'Energy Systems Introduction', ['engineering.thermodynamics', 'engineering.circuits'], 'Understand how energy is generated, distributed, and consumed'],
    ['fossil-fuels', 'Fossil Fuel Power', ['intro'], 'Analyse how coal, gas, and oil plants convert fuel into electricity'],
    ['solar', 'Solar Energy', ['intro', 'science.physics.waves'], 'Capture sunlight with photovoltaic cells and solar thermal systems'],
    ['wind', 'Wind Energy', ['intro', 'engineering.fluids.turbines'], 'Extract kinetic energy from wind with turbine rotors and generators'],
    ['hydro', 'Hydroelectric Power', ['intro', 'engineering.fluids.turbines'], 'Generate electricity from flowing or falling water'],
    ['nuclear-intro', 'Nuclear Energy Introduction', ['intro', 'science.chemistry.atoms'], 'Generate electricity from controlled nuclear fission reactions'],
    ['battery-tech', 'Battery Technology', ['engineering.circuits'], 'Understand battery chemistry, capacity, and charging cycles'],
    ['grid-basics', 'Power Grid Basics', ['intro'], 'Deliver electricity from generators to consumers through the grid'],
    ['energy-storage', 'Energy Storage', ['battery-tech'], 'Store energy in batteries, flywheels, and pumped hydro for later use'],
    ['efficiency-energy', 'Energy Efficiency', ['intro'], 'Reduce waste and improve the ratio of useful output to total input energy'],
  ]),

  // ---- Manufacturing processes (10) ----
  ...topic('engineering.mfg-process', ENG, 'innovator', [WS], [
    ['welding', 'Welding', ['engineering.adv-materials.stress-strain'], 'Join metal parts permanently by fusing them with heat'],
    ['welding-types', 'Welding Types', ['welding'], 'Compare MIG, TIG, arc, and spot welding for different applications'],
    ['machining', 'Machining', ['engineering.manufacturing.cnc-intro'], 'Shape metal parts with turning, milling, drilling, and grinding'],
    ['surface-finish', 'Surface Finishing', ['machining'], 'Apply coatings, polishing, and treatments to improve surface quality'],
    ['heat-treat-process', 'Heat Treatment Processes', ['engineering.adv-materials.heat-treatment'], 'Anneal, temper, quench, and case-harden metals for desired properties'],
    ['casting-adv', 'Advanced Casting', ['engineering.manufacturing.casting-intro'], 'Design sand, investment, and die casting for complex metal parts'],
    ['forging', 'Forging', ['engineering.adv-materials.stress-strain'], 'Shape metal with compressive forces for superior grain structure'],
    ['extrusion', 'Extrusion', ['engineering.adv-materials.stress-strain'], 'Push material through a die to create long parts with a uniform cross-section'],
    ['stamping', 'Stamping and Pressing', ['engineering.manufacturing.sheet-metal'], 'Form sheet metal with dies and presses at high production rates'],
    ['metrology', 'Metrology', ['engineering.manufacturing.quality-control'], 'Measure parts precisely with CMMs, gauges, and optical instruments'],
  ]),
];

// ===========================================================================
// ENGINEERING — CREATOR  (~120 skills)
// Advanced structural, power systems, mechatronics, advanced robotics,
// biomedical, chemical, systems, environmental, nuclear, nanotechnology
// ===========================================================================

const engCreator: SkillNode[] = [

  // ---- Preserved skills ----
  skill('engineering.robotics.advanced', 'Advanced Robotics', ENG, 'creator',
    ['engineering.robotics.basics', 'cs.algorithms.basics', 'engineering.control-systems'],
    'Design robots with advanced perception, planning, and autonomous behaviour', [WS, SY]),

  // ---- Advanced structural analysis (12) ----
  ...topic('engineering.struct-adv', ENG, 'creator', [AD, WS], [
    ['fea-intro', 'Finite Element Analysis Introduction', ['engineering.statics-ext.stress-strain-intro', 'math.linear-algebra'], 'Approximate structural behaviour by dividing a body into small elements'],
    ['fea-meshing', 'FEA Meshing', ['fea-intro'], 'Divide geometry into a mesh of elements for accurate analysis'],
    ['fea-boundary', 'FEA Boundary Conditions', ['fea-meshing'], 'Apply loads and constraints to a finite element model correctly'],
    ['fea-interpretation', 'FEA Results Interpretation', ['fea-boundary'], 'Read stress, strain, and displacement plots to evaluate a design'],
    ['buckling', 'Buckling Analysis', ['engineering.statics-ext.stress-strain-intro'], 'Predict when slender columns and plates will suddenly buckle under compression'],
    ['dynamic-loads', 'Dynamic Load Analysis', ['engineering.dynamics-ext.vibrations-forced'], 'Analyse structures subjected to time-varying and impact loads'],
    ['seismic-design', 'Seismic Design', ['dynamic-loads'], 'Design structures to withstand earthquake forces safely'],
    ['wind-engineering', 'Wind Engineering', ['dynamic-loads', 'engineering.fluids.drag-lift'], 'Analyse and resist wind loads on tall buildings and bridges'],
    ['connection-design', 'Connection Design', ['engineering.structures'], 'Design bolted and welded connections that transfer forces between members'],
    ['prestressed-concrete', 'Prestressed Concrete', ['engineering.struct.reinforced-concrete'], 'Pre-tension steel strands in concrete to improve span and crack resistance'],
    ['structural-optimisation', 'Structural Optimisation', ['fea-interpretation'], 'Use computational methods to find the lightest structure that meets requirements'],
    ['forensic-engineering', 'Forensic Engineering', ['engineering.structures'], 'Investigate structural failures to determine their cause and prevent recurrence'],
  ]),

  // ---- Power systems (12) ----
  ...topic('engineering.power', ENG, 'creator', [WS, SY], [
    ['generation', 'Power Generation', ['engineering.energy.intro', 'engineering.circuits'], 'Design and operate systems that convert energy sources into electricity'],
    ['transformers', 'Transformers', ['engineering.ee.ac-basics'], 'Step voltage up for transmission and down for distribution using electromagnetic induction'],
    ['transmission', 'Power Transmission', ['generation', 'transformers'], 'Deliver electricity over long distances with minimal losses'],
    ['distribution', 'Power Distribution', ['transmission'], 'Route electricity from substations to homes and businesses safely'],
    ['protection', 'Power System Protection', ['distribution'], 'Detect faults and isolate damaged sections with relays and circuit breakers'],
    ['renewable-integration', 'Renewable Integration', ['distribution', 'engineering.energy.solar'], 'Connect intermittent renewable sources to the grid reliably'],
    ['smart-grid', 'Smart Grid', ['distribution'], 'Monitor and optimise power flow in real time with digital technology'],
    ['power-electronics', 'Power Electronics', ['engineering.electronics.mosfets'], 'Convert and control electrical power with semiconductor switches'],
    ['motor-drives', 'Motor Drives', ['power-electronics'], 'Control AC and DC motor speed and torque with electronic drives'],
    ['power-quality', 'Power Quality', ['distribution'], 'Identify and correct harmonics, voltage sags, and other disturbances'],
    ['grounding', 'Grounding and Earthing', ['distribution'], 'Protect people and equipment with proper earthing systems'],
    ['high-voltage', 'High Voltage Engineering', ['transmission'], 'Insulate, test, and manage equipment operating at very high voltages'],
  ]),

  // ---- Mechatronics (12) ----
  ...topic('engineering.mechatronics', ENG, 'creator', [WS, SY], [
    ['intro', 'Mechatronics Introduction', ['engineering.mechanisms', 'engineering.circuits', 'cs.functions'], 'Integrate mechanical, electrical, and software systems into unified designs'],
    ['system-modelling', 'System Modelling', ['intro', 'engineering.controls.transfer-functions'], 'Build mathematical models that capture the behaviour of mechatronic systems'],
    ['embedded-systems', 'Embedded Systems', ['engineering.electronics.embedded-programming'], 'Design dedicated computer systems embedded within larger products'],
    ['real-time-systems', 'Real-Time Systems', ['embedded-systems'], 'Guarantee that software meets strict timing deadlines for safety-critical control'],
    ['sensor-fusion', 'Sensor Fusion', ['engineering.controls.sensor-integration'], 'Combine data from multiple sensors for more accurate state estimation'],
    ['kalman-filter', 'Kalman Filters', ['sensor-fusion', 'math.linear-algebra'], 'Estimate system state optimally from noisy sensor measurements'],
    ['motion-planning', 'Motion Planning', ['engineering.controls.pid', 'cs.algorithms.graph-algorithms'], 'Plan collision-free paths for robots and automated machines'],
    ['motor-selection', 'Motor Selection', ['intro'], 'Choose the right motor type and size for a mechatronic application'],
    ['actuator-design', 'Actuator Design', ['motor-selection'], 'Design actuator systems that deliver the required force, speed, and precision'],
    ['system-integration', 'System Integration', ['intro'], 'Bring mechanical, electrical, and software subsystems together into a working product'],
    ['prototyping-mech', 'Mechatronic Prototyping', ['system-integration'], 'Build and test integrated prototypes iteratively'],
    ['product-design', 'Product Design', ['prototyping-mech'], 'Design complete products from concept through manufacturing and testing'],
  ]),

  // ---- Advanced robotics (15) ----
  ...topic('engineering.adv-robotics', ENG, 'creator', [WS, SY], [
    ['forward-kinematics', 'Forward Kinematics', ['engineering.robotics.advanced', 'math.linear-algebra'], 'Calculate end-effector position from joint angles and link lengths'],
    ['inverse-kinematics', 'Inverse Kinematics', ['forward-kinematics'], 'Compute joint angles needed to reach a desired end-effector position'],
    ['dynamics-robot', 'Robot Dynamics', ['forward-kinematics', 'engineering.dynamics'], 'Model forces and torques required for robot joint motions'],
    ['trajectory-planning', 'Trajectory Planning', ['inverse-kinematics'], 'Generate smooth, timed paths between waypoints for robot arms'],
    ['path-planning', 'Path Planning', ['engineering.mechatronics.motion-planning'], 'Plan obstacle-free routes through complex environments'],
    ['slam', 'SLAM', ['path-planning', 'engineering.mechatronics.sensor-fusion'], 'Build a map while simultaneously tracking the robot position within it'],
    ['computer-vision-robot', 'Robot Vision', ['engineering.robotics.advanced', 'cs.ml.computer-vision'], 'Use cameras and image processing for robot perception and guidance'],
    ['manipulation', 'Manipulation', ['inverse-kinematics'], 'Grasp, move, and manipulate objects with dexterous robot hands'],
    ['mobile-robots', 'Mobile Robot Design', ['path-planning'], 'Design wheeled, legged, or aerial robots that navigate autonomously'],
    ['swarm', 'Swarm Robotics', ['mobile-robots'], 'Coordinate many simple robots to accomplish tasks through emergent behaviour'],
    ['human-robot', 'Human-Robot Interaction', ['engineering.robotics.advanced'], 'Design robots that collaborate safely and intuitively with humans'],
    ['ros-intro', 'ROS Introduction', ['engineering.robotics.advanced'], 'Use the Robot Operating System framework for modular robot software'],
    ['reinforcement-robot', 'Robot Reinforcement Learning', ['engineering.robotics.advanced', 'cs.ml.reinforcement'], 'Train robots to learn tasks through trial and error in simulation and reality'],
    ['soft-robotics', 'Soft Robotics', ['engineering.robotics.advanced', 'engineering.adv-materials.smart-materials'], 'Build robots from flexible materials that deform and adapt to their environment'],
    ['autonomous-systems', 'Autonomous Systems', ['slam', 'engineering.mechatronics.real-time-systems'], 'Design complete autonomous systems that perceive, decide, and act independently'],
  ]),

  // ---- Biomedical engineering (10) ----
  ...topic('engineering.biomedical', ENG, 'creator', [WS, SY], [
    ['intro', 'Biomedical Engineering Introduction', ['engineering.mechanisms', 'science.chemistry.atoms'], 'Apply engineering principles to solve problems in medicine and biology'],
    ['biomechanics', 'Biomechanics', ['intro', 'engineering.statics'], 'Analyse forces and motion in biological systems like bones and muscles'],
    ['biomaterials', 'Biomaterials', ['intro', 'engineering.adv-materials.stress-strain'], 'Design materials that interact safely with living tissue'],
    ['medical-devices', 'Medical Devices', ['intro', 'engineering.circuits'], 'Design instruments and implants that diagnose or treat medical conditions'],
    ['prosthetics', 'Prosthetics', ['biomechanics', 'engineering.robotics.advanced'], 'Engineer artificial limbs that restore function and mobility'],
    ['medical-imaging', 'Medical Imaging', ['intro', 'engineering.signals.intro'], 'Understand X-ray, MRI, CT, and ultrasound imaging technologies'],
    ['tissue-engineering', 'Tissue Engineering', ['biomaterials'], 'Grow replacement tissues using scaffolds, cells, and growth factors'],
    ['biosensors', 'Biosensors', ['medical-devices', 'engineering.electronics.op-amps'], 'Build sensors that detect biological molecules for diagnostics'],
    ['rehabilitation', 'Rehabilitation Engineering', ['prosthetics'], 'Design devices that help people recover from injury or disability'],
    ['bioethics', 'Biomedical Ethics', ['intro'], 'Navigate ethical considerations in medical technology development'],
  ]),

  // ---- Chemical engineering (10) ----
  ...topic('engineering.chemical', ENG, 'creator', [WS, SY], [
    ['intro', 'Chemical Engineering Introduction', ['science.chemistry.reactions', 'engineering.thermodynamics'], 'Design processes that transform raw materials into valuable products'],
    ['mass-balance', 'Mass Balance', ['intro'], 'Account for all material entering, leaving, and accumulating in a process'],
    ['energy-balance', 'Energy Balance', ['mass-balance', 'engineering.thermodynamics'], 'Track all energy flows through a chemical process'],
    ['reaction-engineering', 'Reaction Engineering', ['mass-balance', 'science.chemistry.reactions'], 'Design reactors that control chemical reactions at industrial scale'],
    ['separation', 'Separation Processes', ['mass-balance'], 'Separate mixtures using distillation, filtration, and extraction'],
    ['heat-transfer-chem', 'Heat Transfer in Processes', ['energy-balance', 'engineering.thermo.heat-exchangers'], 'Design heat exchangers and manage thermal energy in chemical plants'],
    ['fluid-transport', 'Fluid Transport', ['engineering.fluids.pipe-flow', 'intro'], 'Size pipes, pumps, and valves to move fluids through a process plant'],
    ['process-control', 'Process Control', ['engineering.controls.pid', 'intro'], 'Automate chemical processes to maintain safe and optimal conditions'],
    ['safety-chem', 'Process Safety', ['intro'], 'Identify hazards and design safeguards for chemical process plants'],
    ['green-chemistry', 'Green Chemistry', ['intro'], 'Design processes that minimise waste, toxicity, and energy consumption'],
  ]),

  // ---- Systems engineering (10) ----
  ...topic('engineering.systems', ENG, 'creator', [WS, AD, SY], [
    ['intro', 'Systems Engineering Introduction', ['engineering.design-process'], 'Manage the design of complex systems from requirements through integration'],
    ['requirements', 'Requirements Engineering', ['intro'], 'Capture, analyse, and trace what a system must do and how well'],
    ['system-architecture', 'System Architecture', ['requirements'], 'Define major components and their interfaces at the system level'],
    ['trade-studies', 'Trade Studies', ['system-architecture'], 'Compare design alternatives quantitatively to select the best option'],
    ['verification-validation', 'Verification & Validation', ['requirements'], 'Confirm the system is built right and that the right system was built'],
    ['risk-management', 'Risk Management', ['intro'], 'Identify, assess, and mitigate risks throughout the system lifecycle'],
    ['configuration-management', 'Configuration Management', ['intro'], 'Track and control changes to system components and documents'],
    ['lifecycle-management', 'Lifecycle Management', ['intro'], 'Plan for design, production, operation, maintenance, and disposal'],
    ['reliability', 'Reliability Engineering', ['verification-validation'], 'Design systems that perform their required function without failure'],
    ['systems-thinking', 'Systems Thinking', ['intro'], 'See how components interact and create emergent behaviour in the whole'],
  ]),

  // ---- Environmental engineering (10) ----
  ...topic('engineering.environmental', ENG, 'creator', [WS, AD, SY], [
    ['intro', 'Environmental Engineering Introduction', ['engineering.fluid-mechanics', 'science.chemistry.reactions'], 'Protect human health and the environment through engineering solutions'],
    ['water-treatment', 'Water Treatment', ['intro'], 'Design systems that purify water for safe drinking and discharge'],
    ['wastewater', 'Wastewater Treatment', ['water-treatment'], 'Remove pollutants from used water before returning it to the environment'],
    ['air-quality', 'Air Quality Engineering', ['intro'], 'Monitor and control air pollutants from industrial and urban sources'],
    ['solid-waste', 'Solid Waste Management', ['intro'], 'Design systems to reduce, reuse, recycle, and safely dispose of waste'],
    ['remediation', 'Site Remediation', ['intro'], 'Clean up contaminated soil and groundwater to restore damaged sites'],
    ['sustainability-eng', 'Sustainable Engineering', ['intro'], 'Design solutions that meet present needs without compromising the future'],
    ['life-cycle-assessment', 'Life Cycle Assessment', ['sustainability-eng'], 'Evaluate the environmental impact of a product from cradle to grave'],
    ['green-building', 'Green Building Design', ['sustainability-eng', 'engineering.structures'], 'Design energy-efficient buildings with minimal environmental footprint'],
    ['climate-engineering', 'Climate Engineering', ['sustainability-eng'], 'Explore engineering approaches to mitigate and adapt to climate change'],
  ]),

  // ---- Nuclear engineering basics (8) ----
  ...topic('engineering.nuclear', ENG, 'creator', [WS, SY], [
    ['intro', 'Nuclear Engineering Introduction', ['engineering.energy.nuclear-intro', 'engineering.thermodynamics'], 'Design and operate nuclear systems for energy and other applications'],
    ['fission', 'Nuclear Fission', ['intro'], 'Split heavy atomic nuclei to release enormous amounts of energy'],
    ['reactor-design', 'Reactor Design', ['fission'], 'Engineer nuclear reactors that sustain and control chain reactions safely'],
    ['reactor-safety', 'Reactor Safety', ['reactor-design'], 'Design multiple safety barriers to prevent radiation release'],
    ['fuel-cycle', 'Nuclear Fuel Cycle', ['reactor-design'], 'Manage nuclear fuel from mining through use to waste disposal'],
    ['radiation-protection', 'Radiation Protection', ['intro'], 'Protect people from harmful radiation with time, distance, and shielding'],
    ['fusion-intro', 'Nuclear Fusion Introduction', ['intro'], 'Explore merging light nuclei as a potential limitless energy source'],
    ['nuclear-applications', 'Nuclear Applications', ['intro'], 'Apply nuclear technology in medicine, industry, and space exploration'],
  ]),

  // ---- Nanotechnology (8) ----
  ...topic('engineering.nano', ENG, 'creator', [WS], [
    ['intro', 'Nanotechnology Introduction', ['engineering.adv-materials.stress-strain', 'science.chemistry.atoms'], 'Engineer materials and devices at the scale of individual atoms and molecules'],
    ['nanomaterials', 'Nanomaterials', ['intro'], 'Explore carbon nanotubes, graphene, and quantum dots with unique properties'],
    ['nanofabrication', 'Nanofabrication', ['intro'], 'Build nanoscale structures with top-down lithography and bottom-up self-assembly'],
    ['nanoelectronics', 'Nanoelectronics', ['intro', 'engineering.electronics.transistors'], 'Shrink electronic components to nanometre scale for faster, smaller circuits'],
    ['nanomedicine', 'Nanomedicine', ['intro', 'engineering.biomedical.intro'], 'Design nanoscale drug delivery systems and diagnostic tools'],
    ['nano-sensors', 'Nanosensors', ['nanomaterials'], 'Detect tiny quantities of chemicals, force, or light at the nanoscale'],
    ['self-assembly', 'Self-Assembly', ['nanomaterials'], 'Harness molecules that spontaneously organise into useful structures'],
    ['nano-ethics', 'Nanotechnology Ethics', ['intro'], 'Consider safety, environmental, and societal implications of nanotechnology'],
  ]),

  // ---- Manufacturing advanced (10) ----
  ...topic('engineering.adv-manufacturing', ENG, 'creator', [WS], [
    ['advanced-cnc', 'Advanced CNC', ['engineering.manufacturing.cnc-intro'], 'Program multi-axis CNC machines for complex three-dimensional parts'],
    ['metal-am', 'Metal Additive Manufacturing', ['engineering.manufacturing.3d-printing'], 'Print metal parts with laser or electron beam powder bed fusion'],
    ['injection-moulding', 'Injection Moulding', ['engineering.manufacturing.casting-intro'], 'Mass-produce plastic parts by injecting molten polymer into moulds'],
    ['composites-manufacturing', 'Composites Manufacturing', ['engineering.adv-materials.composites'], 'Lay up and cure fibre-reinforced composite structures'],
    ['automation-manufacturing', 'Manufacturing Automation', ['engineering.robotics.advanced'], 'Automate production lines with robots, conveyors, and PLCs'],
    ['lean-manufacturing', 'Lean Manufacturing', ['engineering.manufacturing.quality-control'], 'Eliminate waste and optimise flow for efficient production'],
    ['six-sigma', 'Six Sigma', ['lean-manufacturing'], 'Reduce defects and variation with data-driven quality improvement'],
    ['digital-twin', 'Digital Twins', ['engineering.cad.parametric'], 'Create virtual replicas of physical systems for simulation and monitoring'],
    ['industry-4', 'Industry 4.0', ['automation-manufacturing', 'cs.advanced.iot-intro'], 'Connect manufacturing systems with IoT, AI, and cloud for smart factories'],
    ['supply-chain-eng', 'Supply Chain Engineering', ['lean-manufacturing'], 'Design and optimise the flow of materials from suppliers to customers'],
  ]),
];

// ===========================================================================
// EXPORT
// ===========================================================================

export const COMPUTING_SKILLS: SkillNode[] = [
  ...csFoundation,
  ...csDiscovery,
  ...csBuilder,
  ...csInnovator,
  ...csCreator,
  ...engFoundation,
  ...engDiscovery,
  ...engBuilder,
  ...engInnovator,
  ...engCreator,
];
