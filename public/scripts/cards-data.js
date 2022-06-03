const cardsData = [
  // Hold Cards
  {
    index: 0,
    name: "Lucky Wrench",
    caption: "You got the lucky wrench!",
    description:
      "Add 0.25x experience bonus on each roll as long as this card is in your possession.",
    type: "hold",
  },
  {
    index: 1,
    name: "Training Band",
    caption: "You got the training band!",
    description:
      "Gain +0.25x exp every time you attempt a job, so long as this card is in your possession.",
    type: "hold",
  },
  {
    index: 2,
    name: "Silver Tongue",
    caption: "You got the silver tongue!",
    description:
      "Gain +0.25x money every time you complete a job, so long as this card is in your possession.",
    type: "hold",
  },
  {
    index: 3,
    name: "Booster Rocket",
    caption: "You got the booster rocket!",
    description:
      "Travel between sites at 1.25x speed as long as this card is in your possession.",
    type: "hold",
  },
  // Single Use Cards
  {
    index: 4,
    name: "The Golden Wrench",
    caption: "Fix any machine immediately!",
    description:
      "Button ‘er up and go home, or fly to another job. Do not earn any experience points.",
    type: "singleUse",
  },
  {
    index: 5,
    name: "Super-Fuel",
    caption: "The champagne of spaceship fuels!",
    description: "Fill up and get where you’re going in half-time!",
    type: "singleUse",
  },
  {
    index: 6,
    name: "Safety Suit",
    caption: "Wear at hazardous sites!",
    description:
      "Increase job difficulty by 0.25x, but gain total immunity to workplace accidents for the rest of the work week.",
    type: "singleUse",
  },
  {
    index: 7,
    name: "Bodyguard Voucher",
    caption: "Redeem this card for one week of personal bodyguard service!",
    description:
      "Gain immunity from non-cryptid assailants for the remainder of the week.",
    type: "singleUse",
  },
  {
    index: 8,
    name: "PTO",
    caption: "You earned a week of PTO!",
    description: "[INSERT DESCRIPTION]",
    type: "singleUse",
  },
  {
    index: 9,
    name: "Go First",
    caption:
      "Play this card at the start of any week (after rolling) to choose your job site first.",
    description: "",
    type: "singleUse",
  },
  {
    index: 10,
    name: "Team Effort",
    caption:
      "Play this card at the beginning of the work week and choose another player to bring with you to your job site(s).",
    description:
      "When rolling, combine your experience points and multiply by ⅔. Split money evenly from each job.",
    type: "singleUse",
  },
  {
    index: 11,
    name: "Escalation support",
    caption:
      "Play this card at the beginning of any work day to call another mechanic of your choosing.",
    description:
      "If they are at a job site, they will miss a roll. For your roll, combine both of your experience points and multiply by ⅔.",
    type: "singleUse",
  },
  {
    index: 12,
    name: "Cryptid Repellent",
    caption:
      "Apply on skin and clothing to mask your scent from ghosts, vampires and other cryptids!",
    description: "Lasts one work week.",
    type: "singleUse",
  },
  {
    index: 13,
    name: "Energy Drink",
    caption:
      "Play this card at the beginning of any work day and multiply your roll by 1.25x.",
    description: "",
    type: "singleUse",
  },
  {
    index: 14,
    name: "Impact Wrench",
    caption:
      "Time to overtorque some bolts! It’ll be a pain in the neck for the next person, but you’ll be in and out in no time!",
    description:
      "Add 0.15x experience to each roll for the rest of the work week after playing.",
    type: "singleUse",
  },
  {
    index: 15,
    name: "Pilfer",
    caption:
      "Play this card at the beginning of a round to “borrow” a card from another mechanic.",
    description: "You know, permanently.",
    type: "singleUse",
  },
  {
    index: 16,
    name: "Smoke Bomb",
    caption: "Play this card to escape from any assailant.",
    description: "Discard after use",
    type: "singleUse",
  },
  {
    index: 17,
    name: "Personal Portal",
    caption: "Your own personal portal!",
    description:
      "Play this card and instantly travel to any planet. Discard after use.",
    type: "singleUse",
  },
  {
    index: 18,
    name: "Power Cycle",
    caption: "Hey, sometimes that’s all it takes.",
    description:
      "Play this card while working on any job (excluding PMs) and roll 12 to see if the issue is resolved. This will not use up your turn.",
    type: "singleUse",
  },
  // Jobsite Event Cards
  {
    index: 19,
    name: "Workplace Accident",
    caption: "Whoops! So <i>that’s</i> why you’re supposed to lockout/tagout.",
    description: "Spend the remainder of the week in the hospital.",
    type: "jobEvent",
  },
  {
    index: 20,
    name: "Thieves!",
    caption: "Thieves have stolen the machine at your job site.",
    description:
      "Go home or fly to another site. No other mechanics may attempt to service this job.",
    type: "jobEvent",
  },
  {
    index: 21,
    name: "Breakfast",
    caption:
      "It’s for a corporate meeting, but they probably wouldn’t mind if you snuck a plate…",
    description:
      "Multiply your roll by 1.25x today from your improved mood and energy.",
    type: "jobEvent",
  },
  {
    index: 22,
    name: "Chatty client",
    caption:
      "“Awful sorry about your divorce, but I’m just here to fix the machine…”",
    description: "Add 0.25x difficulty to your roll this turn.",
    type: "jobEvent",
  },
  {
    index: 23,
    name: "Order Parts",
    caption: "“Of course it was broken when I found it…”",
    description:
      "Roll a D4 to determine the lead time in days. You may wait at the job site or leave and return when the parts have arrived.",
    type: "jobEvent",
  },
  {
    index: 24,
    name: "Safety Inspector",
    caption: "Joot! It’s the safety inspector!",
    description:
      "Roll a D6 to see if you get caught working unsafely. If you do, pay a $300 fine.",
    type: "jobEvent",
  },
  {
    index: 25,
    name: "Invasion",
    caption: "Time to high-tail it! Go home or fly to another job.",
    description:
      "Any other players at this site must also leave and no one may visit the planet for the rest of the week.",
    type: "jobEvent",
  },
  // Travel Event Cards
  {
    index: 26,
    name: "Spaceship Down",
    caption:
      "It’s always a shame when you see folks on the side of the interstellar highway.",
    description:
      "You may choose to roll once trying to help and extend your travel by half a day. Earn $XX if you succeed and XX experience points either way. Or you may choose to go on your way.",
    type: "travelEvent",
  },
  {
    index: 27,
    name: "Pirates!",
    caption: "Blozee joot! Pirates are after your ship!",
    description:
      "Multiply a D9 by your ship’s speed to see if you get away! If not, relinquish half of your cards randomly.",
    type: "travelEvent",
  },
  {
    index: 28,
    name: "Fender Bender",
    caption: "It’s just a ding.",
    description: "Lose $500.",
    type: "travelEvent",
  },
  {
    index: 29,
    name: "Airlock Breach",
    caption: "If you have more than 5 commodity cards, jettison three.",
    description: "",
    type: "travelEvent",
  },
  {
    index: 30,
    name: "Wormhole",
    caption: "Oh no! You’ve been sucked into a wormhole.",
    description: "Roll the dice to see where you’re spit out!",
    type: "travelEvent",
  },
  {
    index: 31,
    name: "Ship Repairs",
    caption: "Miss a work day doing spaceship repairs.",
    description: "",
    type: "travelEvent",
  },
  // General Event Cards
  {
    index: 32,
    name: "Hotline",
    caption: "You’re on hotline duty!",
    description:
      "Earn an extra $300 immediately. Roll at the beginning of each day for the remainder of the week to see if someone calls. If they do, miss a turn helping them, and gain 50 experience points. If traveling, do not lose your turn.",
    type: "jobEvent, travelEvent",
  },
  {
    index: 33,
    name: "Training Week",
    caption:
      "Skip the remainder of the week training at Satellite Mechanic HQ.",
    description: "Get paid $XX and earn XX experience points.",
    type: "travelEvent",
  },
];

const decks = {
  hold: [0, 1, 2, 3],
  singleUse: [],
  jobEvent: [19, 20, 21, 22, 24, 25, 33],
  travelEvent: [26, 27, 28, 29, 31, 33],
};
