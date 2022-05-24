const jobData = {
  locations: [
    {
      name: "Factory",
      description:
        "Machines making machines making machines! And all of them breaking, constantly.",
      difficulty: 0.1,
      "difficulty-description":
        "Add 0.1x difficulty for the great quantity of machines.",
      exp: 0.1,
      pay: 0.1,
    },
    {
      name: "Warehouse",
      description: "Bring hearing protection and watch out for forklifts.",
      difficulty: 0,
      exp: 0,
      pay: 0,
    },
    {
      name: "Cruise Ship",
      description:
        "Joot these things are dirty! Forget your safety glasses, you’re going to need nose plugs here.",
      difficulty: 0.1,
      exp: 0,
      pay: 0,
    },
    {
      name: "Waterpark",
      description:
        "Wet, uncomfortably warm, and louder than a construction site.",
      difficulty: 0.15,
      "difficulty-description":
        "Add 0.15x difficulty for wet working conditions and screaming children.",
      exp: 0,
      pay: 0,
    },
    {
      name: "Office Complex",
      description: '"Sorry folks, Fixing AC units makes noise."',
      difficulty: 0.15,
      "difficulty-description":
        "Add 0.15x difficulty for trying to work quietly.",
      exp: 0,
      pay: 0.15,
    },
    {
      name: "Resort",
      description:
        "A free room and access to all amenities while you work? Sweeky!",
      difficulty: -0.15,
      "difficulty-description": "Subtract 0.15x difficulty for improved mood.",
      exp: 0,
      pay: 0.15,
    },
    {
      name: "Satellite",
      description: "Do the job without ever touching down!",
      "difficulty-description":
        "Do not add roll-multipliers for planet-specific conditions. Do not roll for any hazards or assailants, but do not collect hazard pay either.",
      difficulty: 0.15,
      exp: 0.15,
      pay: 0.15,
    },
    {
      name: "Freighter",
      description:
        "These things are built like tanks! Of course it’s a real job when they go down.",
      "difficulty-description":
        "Add 0.2x difficulty for challenging machine issues.",
      difficulty: 0.2,
      exp: 0.2,
      pay: 0.2,
    },
  ],
  types: [
    {
      name: "Preventive Maintenance",
      diffexpay: 0,
    },
    {
      name: "Operation Impacted",
      diffexpay: 0.15,
    },
    {
      name: "Operation Halted",
      diffexpay: 0.25,
    },
    {
      name: "Catastrophic Failure",
      diffexpay: 0.5,
    },
  ],
};
