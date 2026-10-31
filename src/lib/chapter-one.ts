import type { Lesson, Step } from "./curriculum";

const check = (question: string, right: string, wrong: string, explanation: string): Step => ({
  id: "check", heading: "Check your understanding", body: [],
  interaction: { kind: "quiz", quiz: { question, options: [
    { label: wrong, correct: false, feedback: explanation },
    { label: right, correct: true, feedback: explanation },
  ] } },
});
const remember = (...body: string[]): Step => ({ id: "remember", heading: "What to remember", body });
const watch = (title: string, embedUrl: string): Step => ({
  id: "watch", heading: "Watch: how Alzheimer's changes the brain",
  body: ["The National Institute on Aging shows how several changes in the brain develop together. Watch here, then explore each change in the next part."],
  video: { title, embedUrl, source: "National Institute on Aging, National Institutes of Health" },
});

export const chapterOneLessons: Lesson[] = [
  {
    id: "1.1", title: "What is Alzheimer's?", minutes: 7, sourceIds: ["dementia", "aging", "brain"],
    steps: [
      { id: "understand", heading: "A brain disease, not a personal failing", body: [
        "Alzheimer's disease gradually damages brain cells and the connections between them. It can affect memory, thinking, language, and everyday independence.",
        "Dementia describes a group of symptoms severe enough to interfere with daily life. Alzheimer's is one cause of dementia, not another word for every dementia.",
        "Forgetting is not a choice. But not every new difficulty is caused by Alzheimer's: illness, pain, medicines, hearing, and vision can also matter.",
      ] },
      { id: "explore", heading: "Dementia is an umbrella term", body: ["Different diseases can cause similar difficulties. Knowing the cause helps clinicians tailor care and treatment."], panels: [
        { title: "Different Types of Dementia", body: [
          "Alzheimer's disease often begins with difficulty retaining recent experiences, although other presentations occur.",
          "Vascular dementia involves injury related to blood flow, including strokes. Attention, planning, and thinking speed may be affected.",
          "Lewy body dementia may involve fluctuating alertness, visual hallucinations, movement changes, and disturbed sleep. Medication sensitivities make an accurate diagnosis important.",
          "Frontotemporal disorders may begin with changes in behavior, personality, or language rather than memory. Mixed dementia means more than one disease process contributes.",
          "These patterns overlap. A symptom checklist cannot establish a diagnosis.",
        ] },
        { title: "What Else Can Cause Confusion?", body: [
          "Depression, medication effects, sleep disorders, thyroid problems, and some vitamin deficiencies can affect cognition. A clinician checks for potentially treatable contributors.",
          "Delirium is a sudden, often fluctuating change in attention and awareness. Infection, dehydration, pain, or medicines can contribute. Delirium can occur on top of dementia and needs prompt assessment.",
          "For new weakness, facial drooping, difficulty speaking, or another emergency, contact emergency services immediately.",
        ] },
      ] },
      check("Your aunt has dementia. What can you conclude?", "The cause still needs clinical assessment", "It must be Alzheimer's", "Dementia describes symptoms. Alzheimer's, vascular disease, Lewy body disease, and other conditions can cause them."),
      remember("Alzheimer's is one cause of dementia. It is not normal aging and not a personal failing.", "A sudden change should not be explained away as the dementia getting worse."),
    ],
  },
  {
    id: "1.2", title: "Normal aging, MCI, and dementia", minutes: 7, sourceIds: ["aging", "mci", "dementia"],
    steps: [
      { id: "understand", heading: "The difference is everyday function", body: [
        "Occasionally losing a word or forgetting where you put something can happen with age. Increasing difficulty with familiar tasks, navigation, language, reasoning, or finances deserves assessment.",
        "Mild cognitive impairment, or MCI, means noticeable cognitive changes beyond what is expected for age, while everyday independence remains largely intact. People may need more effort or reminders.",
        "MCI does not always progress to Alzheimer's or dementia. Some people stay stable or improve. Follow-up helps clinicians understand the cause and changes over time.",
      ], panels: [{ title: "Preparing for an Assessment", body: ["Bring concrete examples, when they started, and whether they affect independence. Include medicines, sleep, mood, hearing, vision, and recent illnesses.", "A screening score alone is not a diagnosis. Education, language, sensory differences, and other health conditions can affect results."] }] },
      { id: "apply", heading: "Notice the pattern, not one mistake", body: ["Consider how often a difficulty happens, whether it is changing, and whether support is now needed. These examples are not a diagnostic test."], interaction: { kind: "forgetfulness" } },
      check("A relative is diagnosed with MCI. What is the best interpretation?", "Follow-up matters, but progression to dementia is not certain", "They will definitely develop Alzheimer's", "MCI has different causes and outcomes. It warrants assessment and follow-up, not a guaranteed prediction."),
      remember("Look for change from the person's usual abilities and effects on daily life.", "Seek prompt assessment for a sudden or rapidly fluctuating change in confusion or alertness."),
    ],
  },
  {
    id: "1.3", title: "How memory works", minutes: 8, sourceIds: ["brain", "aging"],
    steps: [
      { id: "understand", heading: "A memory is a team effort", body: ["Encoding takes in an experience. Consolidation strengthens it over time. Storage depends on changes across networks, and retrieval brings information back when it is needed.", "Attention helps us take in the moment. The hippocampus and nearby entorhinal cortex help link details of new experiences. Sleep supports memory consolidation.", "There are different memory systems. Remembering a visit, knowing a familiar fact, and performing a well-practiced skill do not depend on exactly the same networks."], panels: [{ title: "Memory Systems", body: ["Episodic memory concerns events and their context. Semantic memory is knowledge, such as the meaning of a word. Procedural memory supports learned skills and habits.", "The hippocampus interacts with widespread cortical networks rather than holding every memory in a single location. Some detailed autobiographical memories continue to depend on it.", "Older memories and familiar skills may last longer, but none is guaranteed to remain intact in Alzheimer's."] }] },
      { id: "explore", heading: "From a moment to a memory", body: ["Follow an everyday experience through the network."], interaction: { kind: "memory" } },
      check("Your mother asks about today's visit several times. What might be happening?", "The answer may not be retained reliably as a new memory", "She is deliberately ignoring you", "New-memory difficulties can make repeated information feel new. Respond calmly and consider whether she also needs reassurance."),
      remember("Recent experiences depend heavily on memory-related networks that Alzheimer's often affects early.", "An old story may remain vivid while today's conversation is forgotten. That is not a choice."),
    ],
  },
  {
    id: "1.4", title: "Explore the brain", minutes: 9, sourceIds: ["brain"],
    steps: [
      { id: "explore", heading: "A map, not a map of a whole person", body: ["Select a region to explore its usual functions. Brain areas work together through networks; no one region explains someone's entire behavior."], interaction: { kind: "brain" }, panels: [{ title: "Brain Anatomy", body: [
        "The entorhinal cortex connects cortical information with the hippocampus. Both sit in medial temporal memory networks and are often affected early in Alzheimer's.",
        "The amygdala participates in emotional learning and detecting important or threatening experiences. Emotion also depends on wider networks and context.",
        "Language uses interconnected frontal and temporal networks. Parietal networks contribute to spatial awareness and skilled actions; occipital networks process vision.",
        "The cerebellum helps coordinate movement. The brainstem supports essential functions such as breathing and alertness. White-matter fibers connect distant regions.",
        "A lateral drawing cannot show every deep structure accurately. This is a simplified teaching illustration, not a scan or clinical localization tool.",
      ] }] },
      { id: "apply", heading: "Connect the idea to everyday life", body: ["A person who cannot follow a recipe may be struggling with memory, attention, sequencing, vision, or several of these together.", "Try one step at a time, with the needed item in view. A difficulty is a reason to adapt support, not to label the person by a damaged brain region." ] },
      check("Someone struggles to get dressed. Can one brain region explain everything?", "No. Networks, health, and the environment all matter", "Yes. Every behavior has one damaged region", "Dressing draws on several abilities. Avoid one-to-one explanations between a region and a person's behavior."),
      remember("Alzheimer's affects interconnected networks, with different patterns across people.", "A person is always more than a diagram or diagnosis."),
    ],
  },
  {
    id: "1.5", title: "What happens to neurons?", minutes: 8, sourceIds: ["brain", "treatment"],
    steps: [
      { id: "anatomy", heading: "Meet the neuron", body: ["Dendrites receive signals, the cell body keeps the neuron functioning, and an axon carries signals toward other cells. Chemical messengers help signals cross synapses."], interaction: { kind: "neuron" }, panels: [{ title: "Inside the Cell", body: ["Microtubules are internal structures that help maintain shape and transport materials. Tau normally helps stabilize these tracks.", "Neurons need energy to signal, move materials, and maintain and repair their connections. Alzheimer's affects communication, metabolism, and repair, not just memory as an isolated function.", "Astrocytes support neuronal function and the chemical environment. Microglia help with immune defense and clearing debris. In Alzheimer's, glial responses can become disrupted and contribute to inflammation."] }] },
      { id: "understand", heading: "Connections are everything", body: ["Memories and skills depend on many neurons working together. Synapses change with learning, but using a connection cannot guarantee protection from Alzheimer's.", "As the disease develops, communication becomes disrupted, synapses are lost, and neurons may eventually die. This can make even familiar tasks harder." ] },
      check("Why does losing synapses matter?", "Networks can no longer pass information as reliably", "Each lost synapse removes exactly one memory", "A memory is not a single stored object in one connection. It depends on coordinated activity across networks."),
      remember("Alzheimer's disrupts communication, energy use, repair, and neuronal survival.", "Difficulty is not a failure of effort. Changing the task can help reduce demands on the network."),
    ],
  },
  {
    id: "1.6", title: "How Alzheimer's changes the brain", minutes: 10, sourceIds: ["brain"],
    steps: [
      watch("How Alzheimer's Changes the Brain", "https://www.youtube-nocookie.com/embed/hEw1Yq_4PaA"),
      { id: "explore", heading: "Four connected changes", body: ["Amyloid-beta can accumulate into plaques outside neurons. Abnormal tau can form tangles inside them. Synapses become disrupted, and neurons and brain tissue can be lost.", "Compare the simplified diagrams. These processes interact with inflammation and vascular health; they are not a single, inevitable chain that explains every symptom."], interaction: { kind: "changes" }, panels: [{ title: "Why This Happens", body: ["Amyloid-beta is produced from a larger protein. Problems with its processing or clearance can contribute to accumulation.", "Tau normally supports microtubules. In disease, altered tau can detach and accumulate, disrupting cell transport and function.", "Microglia and astrocytes participate in responses to damage. Their activity can help protect tissue but may also contribute to chronic inflammation.", "Changes in blood vessels and other diseases can contribute to brain injury. Researchers continue to study how these processes interact."] }] },
      check("Which explanation best fits the science?", "Several interacting changes affect networks over time", "One plaque directly explains every symptom", "Amyloid, tau, inflammation, vascular factors, and network loss interact. A single cause cannot explain every person's experience."),
      remember("Brain changes can develop years before noticeable symptoms.", "Protein findings do not predict every symptom or give a personal countdown."),
    ],
  },
  {
    id: "1.7", title: "Why symptoms differ between people", minutes: 6, sourceIds: ["brain", "dementia", "diagnosis"],
    steps: [
      { id: "understand", heading: "Same diagnosis, different experience", body: ["Many people first notice recent-memory difficulties. Others may have more prominent language, visual-spatial, or behavioral changes.", "The pattern and severity of brain changes, other brain diseases, vascular health, sleep, mood, medication effects, and sensory difficulties can influence daily function.", "Mixed disease processes may contribute. Differences do not mean someone is trying less hard." ] },
      { id: "apply", heading: "Two people, two kinds of support", body: ["Rosa repeats a question about lunch. A calm answer and a visible reminder may help. Daniel struggles to name the cup he wants. Extra time, a gesture, and two visible choices may help.", "These fictional examples illustrate support, not diagnostic categories. Notice what makes a task easier for that individual."], panels: [{ title: "What This Does Not Mean", body: ["A language problem alone does not prove Alzheimer's. New symptoms require assessment rather than a guess based on a lesson.", "Pain, infection, poor sleep, sensory difficulties, and medication changes can worsen existing symptoms. Sudden changes warrant prompt medical assessment."] }] },
      check("Two relatives with Alzheimer's need different support. Why?", "Individual networks, other health conditions, and context differ", "One of them must not really have the disease", "A diagnosis does not make daily experiences identical. Adapt to the individual and reassess changing needs."),
      remember("Observe the person, not a fixed script. Familiar routines, fewer distractions, and appropriate support can make a difference."),
    ],
  },
  {
    id: "1.8", title: "How Alzheimer's is diagnosed", minutes: 9, sourceIds: ["diagnosis", "dementia", "aging", "blood"],
    steps: [
      { id: "understand", heading: "The whole picture comes first", body: ["Clinicians ask about symptoms, how they have changed, and how daily independence is affected. Information from the person and someone who knows them well can both help.", "Assessment may include cognitive testing, physical and neurological examination, medication and mood review, laboratory tests, and brain imaging.", "Tests can help identify other contributors and support a diagnosis. No online exercise or one screening score can replace this evaluation." ] },
      { id: "explore", heading: "What tests can and cannot tell you", body: ["Biomarkers measure signs associated with disease. They must be interpreted with symptoms and a full clinical assessment."], panels: [{ title: "Imaging & Biomarkers", body: ["MRI can show structural changes, strokes, or other causes. Shrinkage alone does not prove Alzheimer's.", "Amyloid PET can show amyloid deposits. CSF tests measure substances in fluid around the brain and spinal cord. Certain blood tests can provide biomarker information in selected clinical settings.", "Availability, accuracy, and intended use differ by test. A positive result does not reveal every cause of symptoms or predict an exact course.", "Discuss the reason for testing, what the result would change, limitations, costs, and follow-up with the clinician."] }, { title: "Science Notes", body: ["Contemporary research and diagnostic frameworks increasingly describe Alzheimer's using biological markers, even before clear symptoms.", "Biological criteria and a clinical care recommendation are not the same thing. Do not use this course to seek routine screening of an asymptomatic person; discuss appropriate evaluation with a clinician."] }] },
      check("A scan or blood biomarker is positive. What next?", "Discuss it in the context of a full clinical evaluation", "Use it to predict exactly how many years remain", "Biomarkers add information. They cannot give a personal countdown and do not replace symptoms, function, and clinical assessment."),
      remember("Bring specific examples, a medication list, and a description of usual daily abilities.", "Ask what a test can establish, what it cannot, and how it will change care."),
    ],
  },
  {
    id: "1.9", title: "Treatment today", minutes: 8, sourceIds: ["treatment", "lecanemab", "donanemab"],
    steps: [
      { id: "understand", heading: "Different treatments have different goals", body: ["There is no cure for Alzheimer's. Treatment may support symptoms, slow decline in selected people, and address other conditions that affect daily life.", "Cholinesterase inhibitors can help some people with symptoms, often in mild-to-moderate disease. Memantine is commonly used for moderate-to-severe disease. They do not cure Alzheimer's.", "Amyloid-targeting medicines such as lecanemab and donanemab are approved for selected people with early Alzheimer's, including MCI or mild dementia due to Alzheimer's. They can slow decline, but do not restore lost cognition." ] },
      { id: "explore", heading: "Benefits need a conversation about risks", body: ["Amyloid-targeting treatments can cause amyloid-related imaging abnormalities, or ARIA: swelling or bleeding in the brain. Some events are serious or life-threatening. MRI monitoring and specialist assessment are important.", "Treatment decisions depend on diagnosis, disease stage, medical history, other medicines, risks, and the person's priorities."], panels: [{ title: "Talk with a Clinician", body: ["Ask whether Alzheimer's pathology has been confirmed and whether the treatment is appropriate for the current stage.", "Discuss the expected benefit, infusion or injection schedule, MRI monitoring, genetic risk factors, and how blood-thinning medicines affect risk.", "Ask which symptoms need urgent assessment and whom to contact. Seek emergency care for stroke-like symptoms or other emergencies.", "Do not start, stop, or change a medicine based on this lesson. Current product labeling and a treating specialist guide eligibility and monitoring."] }] },
      check("A medicine may slow decline. Does that mean it restores lost memories?", "No. Slowing decline is different from reversing it", "Yes. Disease-modifying means a cure", "These treatments do not cure Alzheimer's or restore lost cognition. Benefits and potentially serious risks need individualized discussion."),
      remember("Care also includes treating pain and other illness, adapting communication and activities, supporting sleep and safety, and caring for the caregiver."),
    ],
  },
  {
    id: "1.10", title: "Progression without false certainty", minutes: 7, sourceIds: ["stages", "dementia"],
    steps: [
      { id: "understand", heading: "A flexible journey, not a countdown", body: ["Mild, moderate, and severe describe broad patterns of clinical support needs, not precise schedules. The pace and order of changes vary.", "Earlier disease may bring difficulty with recent memory and complex tasks. Moderate disease often involves increasing help with language, orientation, and daily activities.", "Severe disease can involve major difficulties with communication, mobility, eating, and swallowing. Comfort, dignity, and professional support remain central."], panels: [{ title: "Changing Support Needs", body: ["Plan around what the person can currently do and where they need help. Invite them into decisions as much as possible.", "Coughing with meals, food pocketing, or difficulty swallowing need clinical or swallowing-team assessment. Individual texture advice must come from professionals.", "Palliative care can help manage symptoms and support quality of life. Discuss future care preferences early, while the person can participate meaningfully."] }] },
      { id: "apply", heading: "Gradual change is not sudden change", body: ["If someone becomes much more confused over hours or days, do not assume they have entered a new stage. Illness, dehydration, pain, medication effects, or delirium may be involved.", "Seek prompt medical assessment for sudden changes. New weakness, facial drooping, or difficulty speaking requires emergency help." ] },
      check("Your father becomes much more confused in a few hours. What is the safest response?", "Seek prompt medical assessment", "Treat it as expected Alzheimer's progression", "Alzheimer's usually changes gradually. A sudden change can reflect delirium or another urgent problem."),
      remember("No lesson, scan, or stage label can predict an exact personal timeline.", "Support the person's current abilities, plan ahead, and take sudden changes seriously."),
    ],
  },
  {
    id: "1.11", title: "Chapter review", minutes: 10, sourceIds: ["dementia", "mci", "brain", "diagnosis", "treatment", "stages", "blood", "lecanemab", "donanemab"],
    steps: [{ id: "review", heading: "Bring the ideas into everyday care", body: ["Nine questions connect the science with real-life decisions. Take your time and try again whenever you need to."], interaction: { kind: "review" } }],
  },
];
