export type CurriculumSource = { title: string; publisher: string; url: string };

export const curriculumSources: Record<string, CurriculumSource> = {
  dementia: { title: "Dementia", publisher: "National Institute of Neurological Disorders and Stroke, NIH", url: "https://www.ninds.nih.gov/health-information/disorders/dementia" },
  aging: { title: "Memory Problems, Forgetfulness, and Aging", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/memory-loss-and-forgetfulness/memory-problems-forgetfulness-and-aging" },
  mci: { title: "What Is Mild Cognitive Impairment?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/memory-loss-and-forgetfulness/what-mild-cognitive-impairment" },
  brain: { title: "What Happens to the Brain in Alzheimer's Disease?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/alzheimers-causes-and-risk-factors/what-happens-brain-alzheimers-disease" },
  diagnosis: { title: "How Is Alzheimer's Disease Diagnosed?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/alzheimers-symptoms-and-diagnosis/how-alzheimers-disease-diagnosed" },
  treatment: { title: "How Is Alzheimer's Disease Treated?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/alzheimers-treatment/how-alzheimers-disease-treated" },
  stages: { title: "What Are the Signs of Alzheimer's Disease?", publisher: "National Institute on Aging, NIH", url: "https://www.nia.nih.gov/health/alzheimers-symptoms-and-diagnosis/what-are-signs-alzheimers-disease" },
  blood: { title: "FDA Clears First Blood Test Used in Diagnosing Alzheimer's Disease", publisher: "U.S. Food and Drug Administration", url: "https://www.fda.gov/news-events/press-announcements/fda-clears-first-blood-test-used-diagnosing-alzheimers-disease" },
  lecanemab: { title: "Additional Earlier MRI Monitoring for Patients Taking Leqembi", publisher: "U.S. Food and Drug Administration", url: "https://www.fda.gov/drugs/drug-safety-communications/fda-recommend-additional-earlier-mri-monitoring-patients-alzheimers-disease-taking-leqembi-lecanemab" },
  donanemab: { title: "FDA Roundup: July 2, 2024 (Kisunla Approval)", publisher: "U.S. Food and Drug Administration", url: "https://www.fda.gov/news-events/press-announcements/fda-roundup-july-2-2024" },
};