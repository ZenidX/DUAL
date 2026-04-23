function crearDefensas() {
  // Canvia aquest ID pel del calendari on vols crear els events.
  // El trobaràs a Google Calendar > Configuració del calendari > ID del calendari
  var CALENDAR_ID = "POSA_AQUI_EL_ID_DEL_CALENDARI";

  var calendar = CalendarApp.getCalendarById(CALENDAR_ID);
  if (!calendar) {
    Logger.log("ERROR: No s'ha trobat el calendari amb ID: " + CALENDAR_ID);
    return;
  }

  var events = [
    {
      alumne: "Dumont Córcoles, Ismael",
      classe: "ASIX2BCOM",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-04-22T14:30:00"),
      end: new Date("2026-04-22T14:50:00"),
      guests: ["2024_dumont.corcoles@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Murcia Arcas, Oriol",
      classe: "ASIX2ACOM",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-04-22T14:50:00"),
      end: new Date("2026-04-22T15:10:00"),
      guests: ["2023_oriol.murcia@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "López Martínez, Marcos",
      classe: "ASIX2ACOM",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-04-22T15:10:00"),
      end: new Date("2026-04-22T15:30:00"),
      guests: ["2023_marcos.lopez@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Caballero Enero, Arnau",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T14:00:00"),
      end: new Date("2026-05-05T14:20:00"),
      guests: ["2024_arnau.caballero@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Colet Ayllo, Daniel",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T14:20:00"),
      end: new Date("2026-05-05T14:40:00"),
      guests: ["2024_daniel.colet@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Fernández Marino, Javier",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T14:40:00"),
      end: new Date("2026-05-05T15:00:00"),
      guests: ["2024_javier.fernandez@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "García Martínez, Pablo",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T15:00:00"),
      end: new Date("2026-05-05T15:20:00"),
      guests: ["2024_pablo.garcia@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Mas Sales, Pau",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T15:40:00"),
      end: new Date("2026-05-05T16:00:00"),
      guests: ["2024_pau.mas@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Noval Juanola, Lluis",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T16:40:00"),
      end: new Date("2026-05-05T17:00:00"),
      guests: ["2024_lluis.noval@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Oñate Villagrasa, Aitana",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T17:00:00"),
      end: new Date("2026-05-05T17:20:00"),
      guests: ["2024_aitana.onate@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Ozuna Peña, Josther Alinton",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T17:20:00"),
      end: new Date("2026-05-05T17:40:00"),
      guests: ["2024_jostheralinton.ozuna@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Perrone, Valentin",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T17:40:00"),
      end: new Date("2026-05-05T18:00:00"),
      guests: ["2024_valentin.perrone@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Tarira Siia, Brian Douglas",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T18:00:00"),
      end: new Date("2026-05-05T18:20:00"),
      guests: ["2223_brian.tarira@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Blasco Molné, Pol",
      classe: "ASIX2A",
      tutor: "Xavier Lara Moreno",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-05T18:20:00"),
      end: new Date("2026-05-05T18:40:00"),
      guests: ["2023_pol.blasco@iticbcn.cat","xavi.lara@iticbcn.cat","maria.olivella@iticbcn.cat"]
    },
    {
      alumne: "Alonso Vialé, Unai",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T14:00:00"),
      end: new Date("2026-05-06T14:20:00"),
      guests: ["2223_unai.alonso@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Bakali Bakali, Youssef",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T14:20:00"),
      end: new Date("2026-05-06T14:40:00"),
      guests: ["2024_youssef.bakali@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Colomé Fernández, Éric",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T14:40:00"),
      end: new Date("2026-05-06T15:00:00"),
      guests: ["2023_eric.colome@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Córdoba Bañol, David",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T15:00:00"),
      end: new Date("2026-05-06T15:20:00"),
      guests: ["2024_david.cordoba@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Gondal Batool, Sheharyar Ali",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T15:40:00"),
      end: new Date("2026-05-06T16:00:00"),
      guests: ["2024_sheharyar.gondal@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Jaraiz Bravo, Nicolás",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T16:00:00"),
      end: new Date("2026-05-06T16:20:00"),
      guests: ["2024_nicolas.jaraiz@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Maggiorotto Boix, Gianluca",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T16:20:00"),
      end: new Date("2026-05-06T16:40:00"),
      guests: ["2024_gianluca.maggiorotto@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Perez Paulino, Andrés",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T16:40:00"),
      end: new Date("2026-05-06T17:00:00"),
      guests: ["2024_andres.perez@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Sabata Vives, Carla",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T17:00:00"),
      end: new Date("2026-05-06T17:20:00"),
      guests: ["2024_carla.sabata@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Sama Morillas, Raul",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T17:20:00"),
      end: new Date("2026-05-06T17:40:00"),
      guests: ["2223_raul.sama@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Sullka, Maria Cecilia",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T17:40:00"),
      end: new Date("2026-05-06T18:00:00"),
      guests: ["2024_cecilia.sullka@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Viagel López, Jorge",
      classe: "ASIX2B",
      tutor: "Daniel García Jiménez",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-06T18:00:00"),
      end: new Date("2026-05-06T18:20:00"),
      guests: ["2024_jorge.viagel@iticbcn.cat","daniel.garcia@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "de la Cruz Pagé, Guillem",
      classe: "DAW2B",
      tutor: "Juan Manuel Sánchez Bel",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-11T17:20:00"),
      end: new Date("2026-05-11T17:40:00"),
      guests: ["2024_guillem.delacruz@iticbcn.cat","juanmanuel.sanchez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Llorens Espín, Erik",
      classe: "DAW2B",
      tutor: "Juan Manuel Sánchez Bel",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-11T17:40:00"),
      end: new Date("2026-05-11T18:00:00"),
      guests: ["2024_erik.llorens@iticbcn.cat","juanmanuel.sanchez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Lloret Mateos, Lucía",
      classe: "DAW2B",
      tutor: "Juan Manuel Sánchez Bel",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-11T18:00:00"),
      end: new Date("2026-05-11T18:20:00"),
      guests: ["2024_lucia.lloret@iticbcn.cat","juanmanuel.sanchez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Rubio Rosales, Aitor",
      classe: "DAW2B",
      tutor: "Juan Manuel Sánchez Bel",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-11T18:20:00"),
      end: new Date("2026-05-11T18:40:00"),
      guests: ["2024_aitor.rubio@iticbcn.cat","juanmanuel.sanchez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Sevilla Medina, Adrian",
      classe: "DAW2B",
      tutor: "Juan Manuel Sánchez Bel",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-11T18:40:00"),
      end: new Date("2026-05-11T19:00:00"),
      guests: ["2024_adrian.sevilla@iticbcn.cat","juanmanuel.sanchez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Arias Piferrer, Judit",
      classe: "DAW2A",
      tutor: "Roger Sobrino Gil",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-13T14:20:00"),
      end: new Date("2026-05-13T14:40:00"),
      guests: ["2024_judit.arias@iticbcn.cat","roger.sobrino@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Bosch i Pérez, Pau",
      classe: "DAW2A",
      tutor: "Roger Sobrino Gil",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-13T14:40:00"),
      end: new Date("2026-05-13T15:00:00"),
      guests: ["2024_pau.bosch@iticbcn.cat","roger.sobrino@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Sanchez Salas, Cristina",
      classe: "DAW2A",
      tutor: "Roger Sobrino Gil",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-13T15:00:00"),
      end: new Date("2026-05-13T15:20:00"),
      guests: ["2024_cristina.sanchez@iticbcn.cat","roger.sobrino@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Sau López, Joan",
      classe: "DAW2A",
      tutor: "Roger Sobrino Gil",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-13T15:20:00"),
      end: new Date("2026-05-13T15:40:00"),
      guests: ["2024_joan.sau@iticbcn.cat","roger.sobrino@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "González Díaz, Francisco",
      classe: "DAM2B",
      tutor: "David Fernández Solé",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-14T17:40:00"),
      end: new Date("2026-05-14T18:00:00"),
      guests: ["2024_francisco.gonzalez@iticbcn.cat","david.fernandez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "González Márquez, Iván",
      classe: "DAM2B",
      tutor: "David Fernández Solé",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-14T18:00:00"),
      end: new Date("2026-05-14T18:20:00"),
      guests: ["2024_ivan.gonzalez@iticbcn.cat","david.fernandez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Jiménez Amigó, Eric",
      classe: "DAM2B",
      tutor: "David Fernández Solé",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-14T18:20:00"),
      end: new Date("2026-05-14T18:40:00"),
      guests: ["2024_eric.jimenez@iticbcn.cat","david.fernandez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Melguizo Sebastiá, Carolina",
      classe: "DAM2B",
      tutor: "David Fernández Solé",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-14T19:20:00"),
      end: new Date("2026-05-14T19:40:00"),
      guests: ["2023_carolina.melguizo@iticbcn.cat","david.fernandez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    },
    {
      alumne: "Muñoz Baena, Miguel",
      classe: "DAM2B",
      tutor: "David Fernández Solé",
      coord1: "Maria Olivella Romagosa",
      coord2: "Xavier Lara Moreno",
      start: new Date("2026-05-14T19:40:00"),
      end: new Date("2026-05-14T20:00:00"),
      guests: ["2024_miguel.munoz@iticbcn.cat","david.fernandez@iticbcn.cat","maria.olivella@iticbcn.cat","xavi.lara@iticbcn.cat"]
    }
  ];

  var description =
    "CONVOCATORIA DE DEFENSA DEL PROJECTE DUAL 2025-2026\n" +
    "\n" +
    "Alumne: {alumne}\n" +
    "Classe: {classe}\n" +
    "Tutor: {tutor}\n" +
    "Tribunal: {coord1} / {coord2}\n" +
    "\n" +
    "--- FUNCIONAMENT DE LA DEFENSA ---\n" +
    "\n" +
    "1. PRESENTACIÓ (10 min):\n" +
    "   L'alumne exposa el projecte realitzat a l'empresa durant el període de DUAL. " +
    "Cal explicar els objectius, les tasques realitzades, les tecnologies utilitzades, " +
    "els resultats obtinguts i les competències adquirides.\n" +
    "\n" +
    "2. TORN DE PREGUNTES (5 min):\n" +
    "   El tribunal (coordinadors i tutor) formularà preguntes sobre el projecte, " +
    "el dossier i l'experiència a l'empresa. " +
    "L'alumne haurà de defensar i justificar les decisions preses.\n" +
    "\n" +
    "--- DOCUMENTACIÓ REQUERIDA ---\n" +
    "\n" +
    "- Dossier de seguiment\n" +
    "- Presentació (PowerPoint, Google Slides o similar)\n" +
    "\n" +
    "Duració total: 20 minuts\n" +
    "Lloc: ITIC Barcelona (o videoconferència si s'indica)";

  var created = 0;

  for (var i = 0; i < events.length; i++) {
    var ev = events[i];
    var title = ev.alumne + " (" + ev.classe + ") - Defensa Projecte DUAL";

    var desc = description
      .replace("{alumne}", ev.alumne)
      .replace("{classe}", ev.classe)
      .replace("{tutor}", ev.tutor)
      .replace("{coord1}", ev.coord1)
      .replace("{coord2}", ev.coord2);

    var calEvent = calendar.createEvent(title, ev.start, ev.end, {
      description: desc,
      guests: ev.guests.join(","),
      sendInvites: true
    });

    created++;
    Logger.log("Creat: " + title);
  }

  Logger.log("Total events creats: " + created);
}
