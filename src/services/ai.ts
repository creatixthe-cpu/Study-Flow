// AI Study Breakdown Service

export interface AiTopicBreakdown {
  summary: string;
  keyFormulasOrConcepts: string[];
  commonExamPitfalls: string[];
  highYieldRecommendation: string;
}

class AiService {
  async getTopicBreakdown(topicName: string, subjectName: string): Promise<AiTopicBreakdown> {
    // Simulate high-yield reasoning engine (fast, reliable, and rich)
    await new Promise(resolve => setTimeout(resolve, 800));

    const topicLower = topicName.toLowerCase();
    
    if (topicLower.includes('gauss') || topicLower.includes('electromagnetism') || topicLower.includes('physics')) {
      return {
        summary: `${topicName} deals with fundamental vector field laws and surface integrals relating divergence or curl to physical sources.`,
        keyFormulasOrConcepts: [
          'Gauss\'s Law: ∮ E · dA = Q_enclosed / ε₀',
          'Symmetry analysis: spherical, cylindrical, and planar Gaussian surfaces',
          'Boundary conditions at conducting surfaces: E_parallel = 0, E_perpendicular = σ / ε₀',
          'Displacement current and Maxwell-Ampere relation'
        ],
        commonExamPitfalls: [
          'Forgetting that Q_enclosed must ONLY include charge strictly inside the Gaussian boundary.',
          'Assuming field is uniform over the entire surface without verifying geometric symmetry first.',
          'Sign errors with surface normal vector dA (always directed outward).'
        ],
        highYieldRecommendation: 'Practice 3 boundary condition problems where dielectric material changes permittivity at the interface.'
      };
    } else if (topicLower.includes('calculus') || topicLower.includes('linear algebra') || topicLower.includes('math')) {
      return {
        summary: `Core principles in ${topicName}: transforming vector spaces, matrix representations, and multivariable rate evaluations.`,
        keyFormulasOrConcepts: [
          'Characteristic equation: det(A - λI) = 0 for eigenvalues',
          'Diagonalization theorem: A = PDP⁻¹ when A has n linearly independent eigenvectors',
          'Orthogonal projection matrix: P = A(AᵀA)⁻¹Aᵀ',
          'Rank-Nullity theorem: dim(Col A) + dim(Nul A) = n'
        ],
        commonExamPitfalls: [
          'Confusing geometric multiplicity with algebraic multiplicity when checking if diagonalizable.',
          'Not verifying that eigenvectors corresponding to distinct eigenvalues are mutually orthogonal for symmetric matrices.',
          'Arithmetic mistakes during row reduction of (A - λI).'
        ],
        highYieldRecommendation: 'Solve 2 problems testing whether degenerate eigenvalues yield enough linearly independent eigenvectors.'
      };
    } else if (topicLower.includes('chemistry') || topicLower.includes('synthesis') || topicLower.includes('organic')) {
      return {
        summary: `Mechanistic pathways in ${topicName} focusing on electron movement, carbocation stability, and stereochemical outcomes.`,
        keyFormulasOrConcepts: [
          'Electrophilic Aromatic Substitution (EAS): arenium ion intermediate stability',
          'Activating/Ortho-Para directors vs Deactivating/Meta directors',
          'Steric hindrance impact on ortho vs para regioselectivity',
          'Thermodynamic vs kinetic control in substituted rings'
        ],
        commonExamPitfalls: [
          'Attempting Friedel-Crafts alkylation on strongly deactivated rings (nitrobenzene, pyridine).',
          'Carbocation rearrangements during primary alkyl halide alkylations.',
          'Neglecting halogen inductive vs resonance balance (halogens deactivate but direct ortho/para).'
        ],
        highYieldRecommendation: 'Map out synthesis routes incorporating diazonium salts as gateway functional groups.'
      };
    }

    return {
      summary: `High-yield synthesis for ${topicName} in ${subjectName}, distilled for maximum retention and exam readiness.`,
      keyFormulasOrConcepts: [
        `First-principles foundation of ${topicName}`,
        'Core algorithmic / conceptual invariant relations',
        'Boundary cases and asymptotic behavior',
        'Iterative problem decomposition technique'
      ],
      commonExamPitfalls: [
        'Overlooking edge conditions and special limit behaviors.',
        'Misapplying theorem assumptions without verifying preconditions.',
        'Rushing algebraic manipulation before simplifying units.'
      ],
      highYieldRecommendation: `Do 3 timed practice questions on ${topicName} and explain the step-by-step logic aloud without looking at solutions.`
    };
  }
}

export const aiService = new AiService();
