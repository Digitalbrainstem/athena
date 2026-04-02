#!/usr/bin/env python3
"""Generate language-arts.ts — ~2,400 language arts skills for Nexus Academy."""

import os, sys

OUT = []
TOTAL = 0

def w(s=''):
    OUT.append(s)

def counted(n):
    global TOTAL
    TOTAL += n
    return n

# Biome constants
LIB = 'LIB'
NEWS = 'NEWS'
THTR = 'THTR'
DBT = 'DBT'
RUINS = 'RUINS'

AZ = list('abcdefghijklmnopqrstuvwxyz')

def fmt_biomes(biomes):
    return ', '.join(biomes)

def fmt_reqs(reqs):
    return ', '.join(f"'{r}'" for r in reqs)

def fmt_items_expand(items):
    """Format expand items compactly — multiple per line."""
    chunks = []
    for sfx, disp in items:
        # Escape single quotes
        disp = disp.replace("'", "\\'")
        chunks.append(f"['{sfx}', '{disp}']")
    # Group ~4 per line
    lines = []
    for i in range(0, len(chunks), 4):
        lines.append('    ' + ', '.join(chunks[i:i+4]) + ',')
    return '\n'.join(lines)

def emit_skill(sid, name, tier, reqs, desc, biomes):
    counted(1)
    b = fmt_biomes(biomes)
    r = fmt_reqs(reqs)
    name = name.replace("'", "\\'")
    desc = desc.replace("'", "\\'")
    w(f"  skill('{sid}', '{name}', SUB, '{tier}', [{r}], '{desc}', [{b}]),")

def emit_chain(prefix, tier, biomes, steps, entry_reqs=None):
    n = counted(len(steps))
    b = fmt_biomes(biomes)
    w(f"  ...chain('{prefix}', SUB, '{tier}', [{b}], [")
    for sfx, name, desc in steps:
        name = name.replace("'", "\\'")
        desc = desc.replace("'", "\\'")
        w(f"    ['{sfx}', '{name}', '{desc}'],")
    if entry_reqs:
        r = fmt_reqs(entry_reqs)
        w(f"  ], [{r}]),")
    else:
        w("  ]),")
    return n

def emit_expand(prefix, tier, biomes, reqs, template, desc_template, items):
    n = counted(len(items))
    b = fmt_biomes(biomes)
    r = fmt_reqs(reqs)
    template = template.replace("'", "\\'")
    desc_template = desc_template.replace("'", "\\'")
    w(f"  ...expand('{prefix}', SUB, '{tier}', [{b}], [{r}],")
    w(f"    '{template}', '{desc_template}', [")
    w(fmt_items_expand(items))
    w("  ]),")
    return n

def emit_topic(prefix, tier, biomes, skills):
    n = counted(len(skills))
    b = fmt_biomes(biomes)
    w(f"  ...topic('{prefix}', SUB, '{tier}', [{b}], [")
    for sfx, name, reqs, desc in skills:
        r = fmt_reqs(reqs)
        name = name.replace("'", "\\'")
        desc = desc.replace("'", "\\'")
        w(f"    ['{sfx}', '{name}', [{r}], '{desc}'],")
    w("  ]),")
    return n

def emit_parallel(prefix, tier, biomes, reqs, items):
    n = counted(len(items))
    b = fmt_biomes(biomes)
    r = fmt_reqs(reqs)
    w(f"  ...parallel('{prefix}', SUB, '{tier}', [{b}], [{r}], [")
    for sfx, name, desc in items:
        name = name.replace("'", "\\'")
        desc = desc.replace("'", "\\'")
        w(f"    ['{sfx}', '{name}', '{desc}'],")
    w("  ]),")
    return n

def section(title):
    w(f'\n  // ---- {title} ----')

# ===================================================================
# FILE HEADER
# ===================================================================
w("import { topic, chain, parallel, expand, skill } from './types.js';")
w("import type { SkillNode } from './types.js';")
w('')
w("const SUB = 'language-arts';")
w("const LIB = 'library-echoes';")
w("const NEWS = 'newsroom';")
w("const THTR = 'theater';")
w("const DBT = 'debate-hall';")
w("const RUINS = 'ancient-ruins';")


# ===================================================================
# FOUNDATION TIER (~380 skills) — Ages 2-5
# ===================================================================
w('')
w('// ===========================================================================')
w('// FOUNDATION TIER (~380 skills) — Ages 2–5')
w('// ===========================================================================')
w('')
w('const foundationSkills: SkillNode[] = [')

section('Entry-point / preserved skills')
emit_skill('language.listening', 'Listening', 'foundation', [],
    'Active listening and comprehension of spoken language', [LIB, THTR])
emit_skill('language.letters', 'Letter Knowledge', 'foundation', [],
    'Foundational awareness of alphabet letters', [LIB])
emit_skill('language.vocabulary', 'Vocabulary', 'foundation', ['language.listening'],
    'Core spoken and receptive vocabulary', [LIB, THTR])
emit_skill('language.rhyming', 'Rhyming', 'foundation', ['language.listening'],
    'Recognition and production of rhyming words', [LIB, THTR])
emit_skill('language.syllables', 'Syllables', 'foundation', ['language.listening'],
    'Awareness of syllable structure in words', [LIB])
emit_skill('language.phonics', 'Phonics', 'foundation', ['language.letters'],
    'Letter-sound relationships and basic decoding', [LIB])
emit_skill('language.sight-words', 'Sight Words', 'foundation',
    ['language.phonics'], 'Recognition of high-frequency words on sight', [LIB])
emit_skill('language.handwriting', 'Handwriting', 'foundation', ['motor.fine'],
    'Forming letters and words by hand', [LIB])
emit_skill('language.reading', 'Reading', 'foundation',
    ['language.phonics', 'language.sight-words'],
    'Independent reading of connected text', [LIB])

# ------------------------------------------------------------------
section('Pre-literacy & Listening (25)')
# ------------------------------------------------------------------
emit_chain('language.pre-listening', 'foundation', [LIB, THTR], [
    ('env-sounds', 'Environmental Sounds', 'Identify and name common environmental sounds'),
    ('voice-distinction', 'Voice Distinction', 'Distinguish between familiar and unfamiliar voices'),
    ('tone-recognition', 'Tone Recognition', 'Recognize emotional tones in speech'),
    ('rhythm-awareness', 'Rhythm Awareness', 'Detect rhythm and beat patterns in spoken language'),
    ('music-language', 'Music-Language Connection', 'Connect musical patterns to language rhythm'),
])

emit_chain('language.attention', 'foundation', [LIB], [
    ('short-focus', 'Short Focus', 'Maintain attention on a task for one to two minutes'),
    ('sustained', 'Sustained Focus', 'Maintain attention for five or more minutes'),
    ('selective', 'Selective Attention', 'Focus on relevant information amid distractions'),
    ('extended', 'Extended Focus', 'Maintain attention through a complete activity'),
])

emit_chain('language.directions', 'foundation', [LIB, THTR], [
    ('one-step', 'One-Step Directions', 'Follow a single spoken instruction'),
    ('two-step', 'Two-Step Directions', 'Follow two sequential spoken instructions'),
    ('three-step', 'Three-Step Directions', 'Follow three sequential spoken instructions'),
    ('multi-step', 'Multi-Step Directions', 'Follow complex multi-step spoken instructions'),
], ['language.listening'])

emit_topic('language.story-listening', 'foundation', [LIB, THTR], [
    ('interest', 'Story Interest', ['language.listening'], 'Show engagement and attention during story time'),
    ('character-recall', 'Character Recall', ['interest'], 'Remember main characters after hearing a story'),
    ('event-recall', 'Event Recall', ['interest'], 'Remember key events from a story'),
    ('sequence', 'Story Sequence', ['event-recall'], 'Retell story events in correct order'),
    ('prediction', 'Story Prediction', ['character-recall'], 'Predict what might happen next in a story'),
    ('retelling', 'Story Retelling', ['sequence'], 'Retell a complete story with beginning, middle, and end'),
    ('connection', 'Personal Connection', ['retelling'], 'Connect story events to personal experiences'),
    ('response', 'Story Response', ['connection'], 'Express thoughts and feelings about a story'),
    ('picture-reading', 'Picture Reading', ['language.listening'], 'Derive meaning from illustrations in books'),
    ('story-vocabulary', 'Story Vocabulary', ['language.vocabulary'], 'Learn new words encountered in stories'),
    ('favorite-books', 'Favorite Books', ['interest'], 'Choose and revisit preferred stories independently'),
    ('nursery-rhymes', 'Nursery Rhymes', ['language.rhyming'], 'Recite familiar nursery rhymes and songs'),
])

# ------------------------------------------------------------------
section('Phonological Awareness (35)')
# ------------------------------------------------------------------
emit_chain('language.rhyme-skills', 'foundation', [LIB, THTR], [
    ('recognition', 'Rhyme Recognition', 'Identify whether two words rhyme'),
    ('matching', 'Rhyme Matching', 'Match words that share the same rime pattern'),
    ('production', 'Rhyme Production', 'Generate words that rhyme with a given word'),
    ('songs', 'Rhyme in Songs', 'Identify and produce rhymes in songs and chants'),
    ('oddity', 'Rhyme Oddity', 'Identify the word that does not rhyme in a set'),
], ['language.rhyming'])

emit_chain('language.syllable-skills', 'foundation', [LIB], [
    ('counting', 'Syllable Counting', 'Count the number of syllables in spoken words'),
    ('clapping', 'Syllable Clapping', 'Clap out syllable beats in words'),
    ('blending', 'Syllable Blending', 'Blend syllables together to form complete words'),
    ('segmenting', 'Syllable Segmenting', 'Break words apart into individual syllables'),
    ('deletion', 'Syllable Deletion', 'Remove a syllable from a word and say what remains'),
    ('compound-split', 'Compound Splitting', 'Separate compound words into component parts'),
], ['language.syllables'])

emit_chain('language.onset-rime', 'foundation', [LIB], [
    ('identify', 'Onset-Rime Identification', 'Identify the onset and rime in single-syllable words'),
    ('blending', 'Onset-Rime Blending', 'Blend onset and rime to form a complete word'),
    ('segmenting', 'Onset-Rime Segmenting', 'Separate a word into its onset and rime parts'),
    ('substitution', 'Onset-Rime Substitution', 'Replace onsets or rimes to create new words'),
], ['language.syllable-skills.segmenting'])

emit_chain('language.phoneme-skills', 'foundation', [LIB], [
    ('isolation-initial', 'Initial Sound Isolation', 'Identify the first sound in a spoken word'),
    ('isolation-final', 'Final Sound Isolation', 'Identify the last sound in a spoken word'),
    ('isolation-medial', 'Medial Sound Isolation', 'Identify the middle sound in a spoken word'),
    ('identity', 'Phoneme Identity', 'Recognize the same phoneme in different words'),
    ('categorization', 'Phoneme Categorization', 'Group words by shared beginning or ending phonemes'),
    ('blending', 'Phoneme Blending', 'Blend individual phonemes to form a word'),
    ('segmenting', 'Phoneme Segmenting', 'Break a word into its individual phonemes'),
    ('counting', 'Phoneme Counting', 'Count the number of phonemes in a word'),
    ('addition', 'Phoneme Addition', 'Add a phoneme to a word to create a new word'),
    ('deletion', 'Phoneme Deletion', 'Remove a phoneme from a word and say what remains'),
    ('substitution', 'Phoneme Substitution', 'Replace one phoneme with another to make a new word'),
    ('manipulation', 'Phoneme Manipulation', 'Rearrange phonemes within a word'),
], ['language.onset-rime.identify'])

emit_topic('language.phonological', 'foundation', [LIB], [
    ('sound-discrimination', 'Sound Discrimination', ['language.listening'], 'Distinguish between similar speech sounds'),
    ('word-awareness', 'Word Awareness', ['language.listening'], 'Recognize individual words in spoken sentences'),
    ('sentence-segmenting', 'Sentence Segmenting', ['word-awareness'], 'Break spoken sentences into individual words'),
    ('alliteration', 'Alliteration Recognition', ['language.phoneme-skills.isolation-initial'], 'Identify words that begin with the same sound'),
    ('minimal-pairs', 'Minimal Pairs', ['language.phoneme-skills.identity'], 'Distinguish words that differ by only one phoneme'),
    ('continuous-blending', 'Continuous Sound Blending', ['language.phoneme-skills.blending'], 'Blend sounds smoothly without pausing between them'),
    ('phonological-memory', 'Phonological Memory', ['language.phoneme-skills.segmenting'], 'Hold and recall speech sounds in working memory'),
    ('rapid-naming', 'Rapid Naming', ['language.phoneme-skills.identity'], 'Quickly name familiar objects, colors, and letters'),
])


# ------------------------------------------------------------------
section('Alphabet Knowledge (136)')
# ------------------------------------------------------------------
emit_expand('language.letters.upper', 'foundation', [LIB], ['language.letters'],
    'Uppercase {item}', 'Recognize and identify uppercase letter {item}',
    [(l, l.upper()) for l in AZ])

emit_expand('language.letters.lower', 'foundation', [LIB], ['language.letters'],
    'Lowercase {item}', 'Recognize and identify lowercase letter {item}',
    [(l, l.lower()) for l in AZ])

emit_expand('language.letter-sounds', 'foundation', [LIB], ['language.phonics'],
    '{item} Sound', 'Produce the sound associated with the letter {item}',
    [(l, l.upper()) for l in AZ])

emit_expand('language.letters.write-upper', 'foundation', [LIB],
    ['language.handwriting', 'language.letters'],
    'Write Uppercase {item}', 'Form uppercase letter {item} with correct stroke order',
    [(l, l.upper()) for l in AZ])

emit_expand('language.letters.write-lower', 'foundation', [LIB],
    ['language.handwriting', 'language.letters'],
    'Write Lowercase {item}', 'Form lowercase letter {item} with correct stroke order',
    [(l, l.lower()) for l in AZ])

emit_chain('language.alpha-order', 'foundation', [LIB], [
    ('first-five', 'First Five Letters', 'Know the sequence of letters A through E'),
    ('first-ten', 'First Ten Letters', 'Know the sequence of letters A through J'),
    ('first-half', 'First Thirteen Letters', 'Know the sequence of letters A through M'),
    ('second-half', 'Last Thirteen Letters', 'Know the sequence of letters N through Z'),
    ('full-sequence', 'Full Alphabet Sequence', 'Recite the entire alphabet in correct order'),
    ('alphabetize', 'Alphabetize Words', 'Arrange words in alphabetical order by first letter'),
], ['language.letters'])

# ------------------------------------------------------------------
section('Print Concepts (14)')
# ------------------------------------------------------------------
emit_chain('language.print.book', 'foundation', [LIB], [
    ('handling', 'Book Handling', 'Hold a book correctly and turn pages one at a time'),
    ('orientation', 'Book Orientation', 'Identify front cover, back cover, and spine of a book'),
    ('title-page', 'Title Page', 'Locate and identify the title page of a book'),
    ('parts', 'Book Parts', 'Identify title, author, and illustrator on a book'),
])

emit_chain('language.print.direction', 'foundation', [LIB], [
    ('left-right', 'Left-to-Right Tracking', 'Track print from left to right across a page'),
    ('top-bottom', 'Top-to-Bottom Tracking', 'Track print from top to bottom of a page'),
    ('return-sweep', 'Return Sweep', 'Move eyes to the next line after reaching the end'),
], ['language.print.book.handling'])

emit_topic('language.print.awareness', 'foundation', [LIB], [
    ('word-concept', 'Word Concept', ['language.print.direction.left-right'], 'Understand that printed words represent spoken words'),
    ('letter-vs-word', 'Letter vs Word', ['word-concept'], 'Distinguish between a single letter and a whole word'),
    ('word-vs-sentence', 'Word vs Sentence', ['letter-vs-word'], 'Distinguish between a word and a complete sentence'),
    ('spaces', 'Spaces Between Words', ['word-concept'], 'Recognize that spaces separate printed words'),
    ('punctuation-aware', 'Punctuation Awareness', ['word-vs-sentence'], 'Notice periods, question marks, and exclamation marks in print'),
    ('uppercase-start', 'Uppercase at Start', ['spaces'], 'Recognize that sentences begin with an uppercase letter'),
    ('environmental-print', 'Environmental Print', ['language.print.book.handling'], 'Read common signs, labels, and logos in the environment'),
])

# ------------------------------------------------------------------
section('Vocabulary Building (80)')
# ------------------------------------------------------------------
emit_expand('language.vocab.colors', 'foundation', [LIB, THTR], ['language.vocabulary'],
    'Color Word: {item}', 'Recognize and use the word for the color {item}',
    [('red','Red'),('blue','Blue'),('green','Green'),('yellow','Yellow'),
     ('orange','Orange'),('purple','Purple'),('pink','Pink'),('black','Black'),
     ('white','White'),('brown','Brown')])

emit_expand('language.vocab.number-words', 'foundation', [LIB], ['language.vocabulary','math.counting'],
    'Number Word: {item}', 'Recognize and use the word for the number {item}',
    [('one','One'),('two','Two'),('three','Three'),('four','Four'),
     ('five','Five'),('six','Six'),('seven','Seven'),('eight','Eight')])

emit_expand('language.vocab.family', 'foundation', [LIB, THTR], ['language.vocabulary'],
    'Family Word: {item}', 'Understand and use the word {item} for family members',
    [('mother','Mother'),('father','Father'),('sibling','Sibling'),
     ('baby','Baby'),('grandparent','Grandparent')])

emit_expand('language.vocab.body', 'foundation', [LIB], ['language.vocabulary'],
    'Body Word: {item}', 'Name and identify the body part {item}',
    [('head','Head'),('hands','Hands'),('feet','Feet'),('eyes','Eyes'),
     ('ears','Ears'),('mouth','Mouth')])

emit_expand('language.vocab.clothing', 'foundation', [LIB], ['language.vocabulary'],
    'Clothing Word: {item}', 'Identify and name the clothing item {item}',
    [('shirt','Shirt'),('pants','Pants'),('shoes','Shoes'),('hat','Hat')])

emit_expand('language.vocab.food', 'foundation', [LIB], ['language.vocabulary'],
    'Food Word: {item}', 'Identify and name the food category {item}',
    [('fruit','Fruit'),('vegetable','Vegetable'),('bread','Bread'),
     ('milk','Milk'),('water','Water')])

emit_expand('language.vocab.animals', 'foundation', [LIB, THTR], ['language.vocabulary'],
    'Animal Word: {item}', 'Identify and name the animal {item}',
    [('dog','Dog'),('cat','Cat'),('bird','Bird'),('fish','Fish'),
     ('horse','Horse'),('cow','Cow'),('pig','Pig')])

emit_expand('language.vocab.nature', 'foundation', [LIB], ['language.vocabulary'],
    'Nature Word: {item}', 'Identify and name the nature element {item}',
    [('tree','Tree'),('flower','Flower'),('sun','Sun'),('rain','Rain'),('cloud','Cloud')])

emit_expand('language.vocab.actions', 'foundation', [LIB, THTR], ['language.vocabulary'],
    'Action Word: {item}', 'Understand and use the action word {item}',
    [('run','Run'),('jump','Jump'),('walk','Walk'),('eat','Eat'),
     ('sleep','Sleep'),('play','Play'),('read','Read'),('sing','Sing')])

emit_expand('language.vocab.positions', 'foundation', [LIB], ['language.vocabulary','spatial.directions'],
    'Position Word: {item}', 'Understand and use the position word {item}',
    [('up','Up'),('down','Down'),('in','In'),('out','Out'),('over','Over'),('under','Under')])

emit_expand('language.vocab.feelings', 'foundation', [LIB, THTR], ['language.vocabulary'],
    'Feeling Word: {item}', 'Recognize and express the feeling {item}',
    [('happy','Happy'),('sad','Sad'),('angry','Angry'),('scared','Scared'),
     ('tired','Tired'),('excited','Excited')])

emit_expand('language.vocab.opposites', 'foundation', [LIB], ['language.vocabulary'],
    'Opposites: {item}', 'Understand the opposite pair {item}',
    [('big-small','Big and Small'),('hot-cold','Hot and Cold'),('fast-slow','Fast and Slow'),
     ('tall-short','Tall and Short'),('old-new','Old and New'),('loud-quiet','Loud and Quiet')])

emit_expand('language.vocab.size', 'foundation', [LIB], ['language.vocabulary'],
    'Size Word: {item}', 'Compare and describe objects using the size word {item}',
    [('big','Big'),('small','Small'),('medium','Medium'),('tiny','Tiny')])

emit_topic('language.vocab.categories', 'foundation', [LIB], [
    ('sorting', 'Category Sorting', ['language.vocabulary'], 'Sort familiar items into named categories'),
    ('naming', 'Category Naming', ['sorting'], 'Name the category a group of items belongs to'),
    ('membership', 'Category Membership', ['naming'], 'Determine if a given item belongs to a category'),
])


# ------------------------------------------------------------------
section('Early Reading (55)')
# ------------------------------------------------------------------
emit_expand('language.word-families', 'foundation', [LIB], ['language.phonics'],
    '{item} Word Family', 'Read and write words in the {item} word family',
    [('-at','-at'),('-an','-an'),('-ig','-ig'),('-op','-op'),('-ug','-ug'),
     ('-et','-et'),('-in','-in'),('-ot','-ot'),('-un','-un'),('-am','-am'),
     ('-it','-it'),('-en','-en'),('-ap','-ap'),('-ag','-ag'),('-ad','-ad'),
     ('-ab','-ab'),('-ed','-ed'),('-og','-og')])

emit_chain('language.cvc-reading', 'foundation', [LIB], [
    ('short-a', 'Short A CVC Words', 'Read consonant-vowel-consonant words with short a'),
    ('short-e', 'Short E CVC Words', 'Read consonant-vowel-consonant words with short e'),
    ('short-i', 'Short I CVC Words', 'Read consonant-vowel-consonant words with short i'),
    ('short-o', 'Short O CVC Words', 'Read consonant-vowel-consonant words with short o'),
    ('short-u', 'Short U CVC Words', 'Read consonant-vowel-consonant words with short u'),
], ['language.phonics'])

emit_chain('language.sight-word-sets', 'foundation', [LIB], [
    ('pre-primer', 'Pre-Primer Sight Words', 'Read the Dolch pre-primer high-frequency word list'),
    ('primer', 'Primer Sight Words', 'Read the Dolch primer high-frequency word list'),
    ('first-grade', 'First Grade Sight Words', 'Read the Dolch first grade word list'),
    ('second-grade', 'Second Grade Sight Words', 'Read the Dolch second grade word list'),
    ('third-grade', 'Third Grade Sight Words', 'Read the Dolch third grade word list'),
], ['language.sight-words'])

emit_chain('language.blending-reading', 'foundation', [LIB], [
    ('sound-by-sound', 'Sound-by-Sound Blending', 'Blend individual letter sounds to read a word'),
    ('continuous', 'Continuous Blending', 'Smoothly blend sounds without pausing between them'),
    ('chunk', 'Chunk Blending', 'Blend word parts and chunks to decode longer words'),
    ('rapid', 'Rapid Blending', 'Quickly blend sounds to read words fluently'),
], ['language.phonics'])

emit_chain('language.sentence-reading', 'foundation', [LIB], [
    ('simple', 'Simple Sentences', 'Read simple sentences composed of known words'),
    ('two-line', 'Two-Line Text', 'Read connected text of two or more sentences'),
    ('paragraph', 'Short Paragraphs', 'Read short paragraphs with basic comprehension'),
    ('passage', 'Short Passages', 'Read multi-paragraph passages independently'),
], ['language.reading'])

emit_topic('language.early-comprehension', 'foundation', [LIB], [
    ('picture-clues', 'Picture Clues', ['language.reading'], 'Use pictures to support word identification and meaning'),
    ('context-guess', 'Context Guessing', ['language.reading'], 'Use sentence context to figure out unknown words'),
    ('self-monitor', 'Self-Monitoring', ['language.reading'], 'Notice when reading does not make sense'),
    ('rereading', 'Rereading Strategy', ['self-monitor'], 'Reread text when meaning breaks down'),
    ('finger-tracking', 'Finger Tracking', ['language.reading'], 'Track words with a finger while reading'),
    ('echo-reading', 'Echo Reading', ['language.reading'], 'Repeat sentences read aloud by an adult model'),
    ('choral-reading', 'Choral Reading', ['echo-reading'], 'Read aloud in unison with a group'),
    ('paired-reading', 'Paired Reading', ['choral-reading'], 'Read aloud with a partner taking turns'),
    ('independent', 'Independent Reading', ['paired-reading'], 'Read appropriate texts independently and silently'),
    ('stamina', 'Reading Stamina', ['independent'], 'Sustain independent reading for increasing periods'),
])

emit_parallel('language.decoding-strategies', 'foundation', [LIB],
    ['language.phonics', 'language.reading'], [
    ('look-cover', 'Look-Cover-Write', 'Study a word, cover it, and write it from memory'),
    ('word-parts', 'Word Parts Strategy', 'Break unfamiliar words into recognizable parts'),
    ('skip-return', 'Skip and Return', 'Skip an unknown word, read on, then return with context'),
    ('analogy', 'Analogy Decoding', 'Use known words to decode unfamiliar words by analogy'),
])

emit_topic('language.text-features-early', 'foundation', [LIB], [
    ('title-reading', 'Title Reading', ['language.reading'], 'Read and use titles to predict book content'),
    ('label-reading', 'Label Reading', ['language.reading'], 'Read labels and captions accompanying pictures'),
    ('list-reading', 'List Reading', ['language.reading'], 'Read simple lists and written sequences'),
    ('sign-reading', 'Sign Reading', ['language.reading'], 'Read common signs encountered in the environment'),
    ('pattern-text', 'Pattern Text', ['language.reading', 'math.patterns'], 'Read and predict words in patterned and repetitive books'),
])

# ------------------------------------------------------------------
section('Writing Readiness (26)')
# ------------------------------------------------------------------
emit_chain('language.tracing', 'foundation', [LIB], [
    ('straight-lines', 'Trace Straight Lines', 'Trace vertical and horizontal straight lines'),
    ('curved-lines', 'Trace Curved Lines', 'Trace circles and curved shapes'),
    ('zigzag', 'Trace Zigzag Lines', 'Trace zigzag and diagonal line patterns'),
    ('shapes', 'Trace Shapes', 'Trace basic geometric shapes with control'),
    ('patterns', 'Trace Patterns', 'Trace repeating visual patterns accurately'),
], ['motor.fine', 'motor.hand-eye'])

emit_chain('language.early-writing', 'foundation', [LIB], [
    ('first-name', 'First Name Writing', 'Write first name from memory'),
    ('full-name', 'Full Name Writing', 'Write first and last name from memory'),
    ('copy-words', 'Copy Words', 'Copy printed words accurately from a model'),
    ('copy-sentences', 'Copy Sentences', 'Copy short sentences accurately from a model'),
], ['language.handwriting'])

emit_topic('language.writing-foundation', 'foundation', [LIB], [
    ('grip', 'Pencil Grip', ['motor.fine'], 'Hold a writing tool with a proper tripod grip'),
    ('pressure', 'Writing Pressure', ['grip'], 'Apply appropriate pressure when writing'),
    ('letter-spacing', 'Letter Spacing', ['language.early-writing.copy-words'], 'Space letters appropriately within words'),
    ('word-spacing', 'Word Spacing', ['letter-spacing'], 'Leave finger-width spaces between words'),
    ('line-placement', 'Line Placement', ['language.early-writing.copy-words'], 'Write on or near lined paper guidelines'),
    ('drawing-to-writing', 'Drawing to Writing', ['motor.fine'], 'Transition from drawing pictures to forming letters'),
    ('inventive-spelling', 'Inventive Spelling', ['language.phonics'], 'Use knowledge of sounds to attempt spelling words'),
    ('label-pictures', 'Label Pictures', ['inventive-spelling'], 'Write words to label drawn pictures'),
    ('sentence-dictation', 'Sentence Dictation', ['language.listening'], 'Write words or sentences spoken aloud'),
    ('journal-drawing', 'Journal with Drawing', ['label-pictures'], 'Combine drawing and writing to express ideas'),
])

emit_chain('language.writing-mechanics-early', 'foundation', [LIB], [
    ('uppercase-usage', 'Uppercase Usage', 'Use uppercase letters at the beginning of sentences'),
    ('period-usage', 'Period Usage', 'Place a period at the end of a telling sentence'),
    ('question-mark', 'Question Mark Usage', 'Place a question mark at the end of an asking sentence'),
    ('exclamation-mark', 'Exclamation Mark Usage', 'Use exclamation marks for strong feeling or excitement'),
    ('name-capitalization', 'Name Capitalization', 'Capitalize the first letter of proper names'),
    ('pronoun-i', 'Capitalize I', 'Always write the pronoun I as an uppercase letter'),
    ('end-punctuation', 'End Punctuation Choice', 'Choose the correct end punctuation for a sentence'),
], ['language.handwriting'])

w('];')


# ===================================================================
# DISCOVERY TIER (~680 skills) — Ages 6-10
# ===================================================================
w('')
w('// ===========================================================================')
w('// DISCOVERY TIER (~680 skills) — Ages 6–10')
w('// ===========================================================================')
w('')
w('const discoverySkills: SkillNode[] = [')

section('Bridge / preserved skills')
emit_skill('language.reading.fluency', 'Reading Fluency', 'discovery',
    ['language.reading'], 'Read with appropriate speed, accuracy, and expression', [LIB])
emit_skill('language.reading.comprehension', 'Reading Comprehension', 'discovery',
    ['language.reading'], 'Understand and derive meaning from text', [LIB])
emit_skill('language.reading.inference', 'Reading Inference', 'discovery',
    ['language.reading.comprehension'], 'Draw conclusions not explicitly stated in text', [LIB])
emit_skill('language.writing', 'Writing', 'discovery',
    ['language.handwriting', 'language.reading'], 'Compose meaningful written text', [LIB])
emit_skill('language.writing.sentences', 'Sentence Writing', 'discovery',
    ['language.writing'], 'Write complete well-formed sentences', [LIB])
emit_skill('language.writing.paragraphs', 'Paragraph Writing', 'discovery',
    ['language.writing.sentences'], 'Organize related sentences into coherent paragraphs', [LIB])
emit_skill('language.grammar', 'Grammar', 'discovery',
    ['language.reading', 'language.writing'], 'Understand and apply standard English conventions', [LIB])
emit_skill('language.grammar.parts-of-speech', 'Parts of Speech', 'discovery',
    ['language.grammar'], 'Identify and use nouns, verbs, adjectives, and other word classes', [LIB])
emit_skill('language.grammar.sentence-structure', 'Sentence Structure', 'discovery',
    ['language.grammar'], 'Understand how sentences are constructed and organized', [LIB])
emit_skill('language.spelling', 'Spelling', 'discovery',
    ['language.phonics', 'language.writing'], 'Encode words with correct letter sequences', [LIB])
emit_skill('language.punctuation', 'Punctuation', 'discovery',
    ['language.writing'], 'Use punctuation marks correctly in writing', [LIB])

# ------------------------------------------------------------------
section('Phonics Advanced (55)')
# ------------------------------------------------------------------
emit_expand('language.blends.initial', 'discovery', [LIB], ['language.phonics'],
    'Initial Blend {item}', 'Decode words beginning with the consonant blend {item}',
    [('bl','bl'),('cl','cl'),('fl','fl'),('gl','gl'),('pl','pl'),('sl','sl'),
     ('br','br'),('cr','cr'),('dr','dr'),('fr','fr'),('gr','gr'),('pr','pr'),('tr','tr'),('sw','sw')])

emit_expand('language.blends.final', 'discovery', [LIB], ['language.phonics'],
    'Final Blend {item}', 'Decode words ending with the consonant blend {item}',
    [('nd','nd'),('nk','nk'),('nt','nt'),('mp','mp'),('ft','ft'),('lt','lt'),('lk','lk'),('sk','sk')])

emit_expand('language.digraphs', 'discovery', [LIB], ['language.phonics'],
    'Digraph {item}', 'Read and spell words containing the digraph {item}',
    [('ch','ch'),('sh','sh'),('th','th'),('wh','wh'),('ph','ph')])

emit_expand('language.vowel-teams', 'discovery', [LIB], ['language.phonics'],
    'Vowel Team {item}', 'Read words with the vowel team {item}',
    [('ai','ai'),('ay','ay'),('ea','ea'),('ee','ee'),('oa','oa'),('ow','ow'),('ie','ie'),('ue','ue')])

emit_chain('language.r-controlled', 'discovery', [LIB], [
    ('ar', 'R-Controlled ar', 'Read words with the ar vowel pattern'),
    ('er', 'R-Controlled er', 'Read words with the er vowel pattern'),
    ('ir', 'R-Controlled ir', 'Read words with the ir vowel pattern'),
    ('or', 'R-Controlled or', 'Read words with the or vowel pattern'),
    ('ur', 'R-Controlled ur', 'Read words with the ur vowel pattern'),
], ['language.phonics'])

emit_chain('language.silent-e', 'discovery', [LIB], [
    ('a-e', 'Silent E with a', 'Read words where silent e makes a say its long sound'),
    ('i-e', 'Silent E with i', 'Read words where silent e makes i say its long sound'),
    ('o-e', 'Silent E with o', 'Read words where silent e makes o say its long sound'),
], ['language.phonics'])

emit_expand('language.diphthongs', 'discovery', [LIB], ['language.phonics'],
    'Diphthong {item}', 'Read words containing the diphthong {item}',
    [('oi','oi'),('oy','oy'),('ou','ou'),('ow-diph','ow')])

emit_parallel('language.soft-sounds', 'discovery', [LIB], ['language.phonics'], [
    ('soft-c', 'Soft C', 'Pronounce c as /s/ before e, i, or y'),
    ('soft-g', 'Soft G', 'Pronounce g as /j/ before e, i, or y'),
])

emit_chain('language.multisyllabic', 'discovery', [LIB], [
    ('two-syllable', 'Two-Syllable Decoding', 'Decode two-syllable words using syllable division rules'),
    ('three-syllable', 'Three-Syllable Decoding', 'Decode words with three syllables'),
    ('four-plus', 'Multi-Syllable Decoding', 'Decode words with four or more syllables'),
    ('syllable-types', 'Syllable Type Recognition', 'Identify open, closed, and vowel-team syllable types'),
    ('stress-patterns', 'Stress Patterns', 'Identify stressed and unstressed syllables in words'),
    ('schwa', 'Schwa Recognition', 'Recognize the reduced vowel sound in unstressed syllables'),
], ['language.syllable-skills.segmenting'])

# ------------------------------------------------------------------
section('Reading Fluency (30)')
# ------------------------------------------------------------------
emit_chain('language.fluency.development', 'discovery', [LIB, THTR], [
    ('rate-awareness', 'Rate Awareness', 'Understand and monitor personal reading speed'),
    ('accuracy-practice', 'Accuracy Practice', 'Read grade-level text with 95 percent or higher accuracy'),
    ('phrasing', 'Phrasing', 'Group words into meaningful phrases while reading aloud'),
    ('expression', 'Expression', 'Read with appropriate vocal expression and intonation'),
    ('prosody', 'Prosody', 'Apply pitch, stress, and rhythm patterns in oral reading'),
    ('self-correction', 'Self-Correction', 'Notice and independently fix miscues during oral reading'),
], ['language.reading.fluency'])

emit_topic('language.fluency.practice', 'discovery', [LIB, THTR], [
    ('repeated-reading', 'Repeated Reading', ['language.reading.fluency'], 'Reread familiar text to build speed and accuracy'),
    ('timed-reading', 'Timed Reading', ['language.fluency.development.rate-awareness'], 'Read passages within target time frames'),
    ('readers-theater', 'Readers Theater', ['language.fluency.development.expression'], 'Perform scripts with fluency and theatrical expression'),
    ('poetry-oral', 'Poetry Oral Reading', ['language.fluency.development.prosody'], 'Read poetry aloud with attention to rhythm and expression'),
    ('dialogue-reading', 'Dialogue Reading', ['language.fluency.development.expression'], 'Read character dialogue with distinct voices'),
    ('sight-word-fluency', 'Sight Word Fluency', ['language.sight-words'], 'Recognize high-frequency words instantly on sight'),
    ('phrase-fluency', 'Phrase Fluency', ['language.fluency.development.phrasing'], 'Read common multi-word phrases as single units'),
    ('punctuation-guided', 'Punctuation-Guided Reading', ['language.punctuation'], 'Use punctuation cues to guide pausing and intonation'),
    ('volume-control', 'Volume Control', ['language.fluency.development.expression'], 'Adjust reading volume appropriately for the setting'),
    ('reading-endurance', 'Reading Endurance', ['language.fluency.development.accuracy-practice'], 'Sustain fluent reading for extended periods of time'),
])

emit_chain('language.fluency.genre', 'discovery', [LIB, THTR], [
    ('narrative', 'Narrative Fluency', 'Read narrative text with story-appropriate pacing and expression'),
    ('informational', 'Informational Fluency', 'Read informational text with appropriate emphasis on key terms'),
    ('poetic', 'Poetic Fluency', 'Read poetry honoring line breaks, meter, and stanza pauses'),
    ('dramatic', 'Dramatic Fluency', 'Read dramatic scripts with character voice and stage emotion'),
    ('multi-genre', 'Multi-Genre Fluency', 'Adjust reading style and pace for different text types'),
], ['language.fluency.development.prosody'])

emit_parallel('language.fluency.assessment', 'discovery', [LIB],
    ['language.fluency.development.self-correction'], [
    ('self-assess', 'Fluency Self-Assessment', 'Evaluate personal reading fluency strengths and areas for growth'),
    ('goal-setting', 'Fluency Goal Setting', 'Set and track specific reading fluency improvement goals'),
    ('peer-reading', 'Peer Reading', 'Read aloud to a partner and provide supportive feedback'),
    ('audience-reading', 'Audience Reading', 'Read aloud to a group with confidence and clarity'),
])


# ------------------------------------------------------------------
section('Reading Comprehension (80)')
# ------------------------------------------------------------------
emit_chain('language.comp.literal', 'discovery', [LIB], [
    ('main-idea', 'Main Idea', 'Identify the central point or thesis of a text'),
    ('key-details', 'Key Details', 'Locate important details that support the main idea'),
    ('sequence', 'Sequence of Events', 'Identify and describe the order of events in a text'),
    ('retelling', 'Retelling', 'Accurately retell a text including all key story elements'),
    ('summarizing', 'Summarizing', 'Condense a text into its most essential points'),
    ('paraphrasing', 'Paraphrasing', 'Restate text information accurately in your own words'),
    ('explicit-info', 'Explicit Information', 'Locate information directly stated in a passage'),
    ('text-evidence', 'Text Evidence', 'Cite specific text passages to support an answer'),
], ['language.reading.comprehension'])

emit_chain('language.comp.inferential', 'discovery', [LIB], [
    ('predictions', 'Making Predictions', 'Use text clues and prior knowledge to predict outcomes'),
    ('conclusions', 'Drawing Conclusions', 'Reach logical conclusions based on text evidence'),
    ('compare-contrast', 'Compare and Contrast', 'Identify similarities and differences within or across texts'),
    ('cause-effect', 'Cause and Effect', 'Identify causal relationships between events in text'),
    ('fact-opinion', 'Fact vs Opinion', 'Distinguish factual statements from opinions in text'),
    ('author-purpose', 'Author Purpose', 'Determine why the author wrote the text'),
    ('point-of-view', 'Point of View', 'Identify the narrator or author perspective in a text'),
    ('generalize', 'Generalizing', 'Form broad statements supported by text evidence'),
], ['language.reading.inference'])

emit_topic('language.comp.connections', 'discovery', [LIB], [
    ('text-self', 'Text-to-Self', ['language.reading.comprehension'], 'Connect text content to personal experiences and feelings'),
    ('text-text', 'Text-to-Text', ['text-self'], 'Compare ideas across two or more texts'),
    ('text-world', 'Text-to-World', ['text-text'], 'Connect text content to real-world knowledge and events'),
    ('visualizing', 'Visualizing', ['language.reading.comprehension'], 'Create vivid mental images from text descriptions'),
    ('questioning', 'Questioning', ['language.reading.comprehension'], 'Generate thoughtful questions before, during, and after reading'),
    ('monitoring', 'Comprehension Monitoring', ['questioning'], 'Check understanding while reading and apply fix-up strategies'),
])

emit_parallel('language.comp.text-types', 'discovery', [LIB, THTR],
    ['language.reading.comprehension'], [
    ('fiction', 'Fiction Comprehension', 'Comprehend narrative fictional texts across genres'),
    ('nonfiction', 'Nonfiction Comprehension', 'Comprehend informational nonfiction texts'),
    ('poetry-comp', 'Poetry Comprehension', 'Derive meaning and feeling from poetry'),
    ('drama-comp', 'Drama Comprehension', 'Comprehend play scripts and dramatic works'),
    ('procedural', 'Procedural Text', 'Follow written step-by-step instructions accurately'),
    ('persuasive-comp', 'Persuasive Text Comprehension', 'Identify arguments and opinions in persuasive writing'),
    ('biography-comp', 'Biography Comprehension', 'Comprehend biographical and autobiographical texts'),
    ('myth-folktale', 'Myths and Folktales', 'Comprehend cultural myths, fables, and folk stories'),
])

emit_chain('language.comp.analysis', 'discovery', [LIB], [
    ('character-traits', 'Character Traits', 'Identify character personality traits from actions and dialogue'),
    ('character-motivation', 'Character Motivation', 'Determine why characters behave as they do'),
    ('setting-analysis', 'Setting Analysis', 'Analyze how setting influences events and mood in a story'),
    ('problem-solution', 'Problem and Solution', 'Identify central problems and their resolutions in text'),
    ('theme-simple', 'Theme Identification', 'Identify the lesson, moral, or central message of a story'),
    ('story-elements', 'Story Elements', 'Identify characters, setting, plot, problem, and resolution'),
    ('genre-recognition', 'Genre Recognition', 'Identify the genre of a text and its key characteristics'),
    ('text-features', 'Text Features', 'Use headings, captions, glossaries, and indexes to locate information'),
    ('text-structure', 'Text Structure', 'Identify organizational patterns like chronological and compare-contrast'),
    ('graphic-aids', 'Graphic Aids', 'Interpret charts, graphs, maps, and diagrams found in text'),
], ['language.reading.comprehension'])

emit_topic('language.comp.strategies-adv', 'discovery', [LIB], [
    ('annotation', 'Annotation', ['language.reading.comprehension'], 'Mark up text with notes, highlights, and questions'),
    ('graphic-organizers', 'Graphic Organizers', ['language.reading.comprehension'], 'Use visual tools to organize and process comprehension'),
    ('close-reading', 'Close Reading', ['language.comp.literal.text-evidence'], 'Read carefully and repeatedly for deep understanding'),
    ('context-evidence', 'Contextual Evidence', ['language.comp.literal.text-evidence'], 'Use surrounding text to clarify meaning of words and passages'),
    ('discussion-reading', 'Discussion-Based Reading', ['language.comp.connections.text-self'], 'Discuss texts collaboratively to deepen understanding'),
    ('journal-response', 'Reading Response Journal', ['language.writing'], 'Write reflectively about texts to process understanding'),
    ('book-club', 'Book Club Participation', ['discussion-reading'], 'Collaborate with peers to analyze shared reading'),
    ('independent-selection', 'Independent Book Selection', ['language.comp.analysis.genre-recognition'], 'Choose appropriate books based on interest and reading level'),
])

emit_parallel('language.comp.vocab-reading', 'discovery', [LIB],
    ['language.reading.comprehension', 'language.vocabulary'], [
    ('context-in-reading', 'Context Clues in Reading', 'Use context to determine unknown word meanings while reading'),
    ('word-reference', 'Word Reference Skills', 'Use dictionaries and glossaries efficiently while reading'),
    ('domain-words', 'Domain-Specific Words', 'Learn subject-specific vocabulary encountered in reading'),
    ('figurative-intro', 'Figurative Language Introduction', 'Recognize similes, metaphors, and other figures in text'),
    ('sensory-words', 'Sensory Words', 'Identify and appreciate words that appeal to the five senses'),
])

emit_chain('language.comp.critical-early', 'discovery', [LIB, NEWS], [
    ('reliability', 'Source Reliability', 'Consider whether information comes from a trustworthy source'),
    ('purpose-eval', 'Purpose Evaluation', 'Evaluate whether a text achieves its intended purpose'),
    ('bias-intro', 'Bias Introduction', 'Notice when a text presents only one perspective'),
    ('compare-accounts', 'Comparing Accounts', 'Compare two different accounts of the same event or topic'),
    ('multimedia-comp', 'Multimedia Comprehension', 'Integrate information from text, images, and multimedia'),
    ('research-reading', 'Research Reading', 'Read strategically to gather information for a specific purpose'),
], ['language.reading.comprehension'])

emit_topic('language.comp.response', 'discovery', [LIB, THTR], [
    ('oral-response', 'Oral Response', ['language.reading.comprehension'], 'Share thoughts about texts verbally with detail and clarity'),
    ('written-response', 'Written Response', ['language.writing', 'language.reading.comprehension'], 'Write organized short responses to reading'),
    ('creative-response', 'Creative Response', ['language.reading.comprehension'], 'Respond to reading through art, drama, or creative writing'),
    ('comparison-response', 'Comparison Response', ['language.comp.inferential.compare-contrast'], 'Write comparisons of characters, events, or themes across texts'),
    ('recommendation', 'Book Recommendation', ['language.comp.connections.text-self'], 'Recommend books to peers with clear reasoning'),
    ('evidence-response', 'Evidence-Based Response', ['language.comp.literal.text-evidence'], 'Support all reading responses with specific text evidence'),
])

emit_parallel('language.comp.genre-features', 'discovery', [LIB, THTR],
    ['language.comp.analysis.genre-recognition'], [
    ('realistic-fiction', 'Realistic Fiction', 'Comprehend fiction set in believable real-world settings'),
    ('historical-fiction', 'Historical Fiction', 'Comprehend fiction set in a specific historical period'),
    ('fantasy', 'Fantasy', 'Comprehend fantasy stories with magical or supernatural elements'),
    ('sci-fi-intro', 'Science Fiction Introduction', 'Comprehend stories exploring scientific or futuristic themes'),
    ('mystery', 'Mystery', 'Follow clues and solve mysteries alongside fictional detectives'),
    ('adventure', 'Adventure Stories', 'Comprehend action-driven adventure narratives'),
    ('humor', 'Humor in Text', 'Recognize and appreciate humor and wordplay in writing'),
    ('informational-article', 'Informational Articles', 'Comprehend magazine-style informational articles'),
    ('autobiography-comp', 'Autobiography', 'Comprehend first-person life narrative texts'),
    ('fable', 'Fables and Morals', 'Comprehend fables and identify their moral lessons'),
])

