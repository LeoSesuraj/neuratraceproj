export type CurriculumSource = { title: string; publisher: string; url: string };

export const curriculumSources: Record<string, CurriculumSource> = {
  dementia: { title: "What Is Dementia? Symptoms, Types, and Diagnosis", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/what-is-dementia" },
  aging: { title: "Memory, Forgetfulness, and Aging: What's Normal and What's Not?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/memory-forgetfulness-and-aging-whats-normal-and-whats-not" },
  mci: { title: "What Is Mild Cognitive Impairment?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/what-is-mild-cognitive-impairment" },
  brain: { title: "What Happens to the Brain in Alzheimer's Disease?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/alzheimers-causes-and-risk-factors/what-happens-brain-alzheimers-disease" },
  diagnosis: { title: "How Is Alzheimer's Disease Diagnosed?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/alzheimers-symptoms-and-diagnosis/how-alzheimers-disease-diagnosed" },
  treatment: { title: "How Is Alzheimer's Disease Treated?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/alzheimers-treatment/how-alzheimers-disease-treated" },
  stages: { title: "What Are the Signs of Alzheimer's Disease?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/alzheimers-symptoms-and-diagnosis/what-are-signs-alzheimers-disease" },
};