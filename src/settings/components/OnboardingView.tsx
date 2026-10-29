// ============================================================
// Mochi – Onboarding Experience View
// ============================================================
import React, { useState } from 'react';
import type { AppSettings, PetData, PersonalityPreset } from '../../shared/types';
import { PERSONALITY_PRESETS } from '../../shared/constants';

interface OnboardingViewProps {
  petData: PetData | null;
  settings: AppSettings;
  onComplete: (data: { petData: Partial<PetData>; settings: Partial<AppSettings> }) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  petData,
  settings,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(petData?.name || 'Mochi');
  const [furColor, setFurColor] = useState<string>(petData?.appearance.furColor || '#FFF8F0');
  const [patchColor, setPatchColor] = useState<string>(petData?.appearance.patchColor || '#E8834A');
  const [personality, setPersonality] = useState<PersonalityPreset>(
    petData?.personality.preset || 'playful'
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);

  const handleFinish = () => {
    onComplete({
      petData: {
        name: name.trim() || 'Mochi',
        appearance: {
          ...(petData?.appearance || {
            size: 1.0,
            eyeColor: '#4A9FE8',
            accessories: [],
          }),
          furColor,
          patchColor,
        },
        personality: PERSONALITY_PRESETS[personality] || PERSONALITY_PRESETS.playful,
      },
      settings: {
        soundEnabled,
        onboardingComplete: true,
      },
    });
  };

  return (
    <div style={styles.container}>
      {/* Top Banner / Pet Preview */}
      <div style={styles.banner}>
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: furColor,
            border: `6px solid ${patchColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 52,
            boxShadow: '0 8px 24px rgba(230, 140, 110, 0.25)',
          }}
        >
          🐱
        </div>
        <h1 style={styles.title}>
          {step === 1 && "Hi! I'm your new desktop kitten. Can I keep you company?"}
          {step === 2 && `Nice to meet you! Let's style ${name || 'me'}.`}
          {step === 3 && 'How would you like me to behave?'}
          {step === 4 && "You're all set! Ready to explore together?"}
        </h1>
        <p style={styles.subtitle}>
          Step {step} of 4 • Fully offline, lightweight, and gentle companion
        </p>
      </div>

      {/* Step Content */}
      <div style={styles.body}>
        {step === 1 && (
          <div style={styles.stepBox}>
            <label style={styles.label}>What would you like to name your cat?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mochi, Nala, Biscuit..."
              style={styles.textInput}
              autoFocus
            />
            <p style={styles.hint}>
              You can always rename your cat anytime in the Pet Room settings.
            </p>
          </div>
        )}

        {step === 2 && (
          <div style={styles.stepBox}>
            <div style={styles.row}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Fur Base Color</label>
                <input
                  type="color"
                  value={furColor}
                  onChange={(e) => setFurColor(e.target.value)}
                  style={styles.colorInput}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Cute Patch Color</label>
                <input
                  type="color"
                  value={patchColor}
                  onChange={(e) => setPatchColor(e.target.value)}
                  style={styles.colorInput}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <label style={styles.label}>Sound Effects</label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  style={styles.checkbox}
                />
                <span>Enable soft meows, purrs, and playful sounds (can be muted anytime)</span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={styles.stepBox}>
            <label style={styles.label}>Choose Personality Archetype</label>
            <div style={styles.grid2}>
              {(['playful', 'cuddly', 'curious', 'sleepy'] as PersonalityPreset[]).map((p) => (
                <div
                  key={p}
                  onClick={() => setPersonality(p)}
                  style={{
                    ...styles.archetypeCard,
                    ...(personality === p ? styles.archetypeActive : {}),
                  }}
                >
                  <h4 style={styles.archetypeName}>
                    {p === 'playful' && '🎾 Playful'}
                    {p === 'cuddly' && '💖 Cuddly'}
                    {p === 'curious' && '🔍 Curious'}
                    {p === 'sleepy' && '💤 Sleepy'}
                  </h4>
                  <p style={styles.archetypeDesc}>
                    {p === 'playful' && 'Loves chasing the cursor & pouncing on balls'}
                    {p === 'cuddly' && 'Prefers being petted and sitting by your window'}
                    {p === 'curious' && 'Wanders around, climbing edges and investigating'}
                    {p === 'sleepy' && 'Very calm, takes frequent cozy naps as you work'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={styles.stepBox}>
            <div style={styles.guideBox}>
              <h3 style={styles.guideHeading}>💡 Helpful Tips:</h3>
              <ul style={styles.guideList}>
                <li><strong>Stroke gently</strong> over Mochi with your cursor to pet and hear purrs.</li>
                <li><strong>Double-click tray icon</strong> or press <code>Ctrl+Shift+M</code> to hide or show.</li>
                <li><strong>Click-Through mode:</strong> Press <code>Ctrl+Shift+C</code> if you need clicks to pass straight through.</li>
                <li><strong>Right-click the tray icon</strong> to summon toys, treats, or open the full Pet Room!</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div style={styles.footer}>
        <button
          onClick={handleFinish}
          style={styles.skipBtn}
        >
          Skip Setup
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              style={styles.backBtn}
            >
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              style={styles.nextBtn}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              style={styles.finishBtn}
            >
              🎉 Let's Go!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#FFF8F4',
    color: '#4A3E3D',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
    userSelect: 'none',
  },
  banner: {
    padding: '30px 24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 6,
    color: '#3B2D2B',
  },
  subtitle: {
    fontSize: 12,
    color: '#8A7B79',
    margin: 0,
  },
  body: {
    flex: 1,
    padding: '10px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBox: {
    width: '100%',
    maxWidth: 500,
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#5C4A48',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 16,
    borderRadius: 12,
    border: '2px solid #EBDAD4',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    color: '#3B2D2B',
  },
  hint: {
    fontSize: 12,
    color: '#9C8C8A',
    marginTop: 8,
  },
  row: {
    display: 'flex',
    gap: 20,
  },
  colorInput: {
    width: '100%',
    height: 48,
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 13,
    color: '#5C4A48',
    cursor: 'pointer',
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: '#FF8866',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  archetypeCard: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    border: '2px solid #EBDAD4',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  archetypeActive: {
    borderColor: '#FF8866',
    backgroundColor: '#FFF2EE',
  },
  archetypeName: {
    fontSize: 14,
    fontWeight: 700,
    margin: '0 0 6px 0',
    color: '#3B2D2B',
  },
  archetypeDesc: {
    fontSize: 11,
    color: '#7D6D6B',
    margin: 0,
    lineHeight: 1.3,
  },
  guideBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    border: '1px solid #EBDAD4',
  },
  guideHeading: {
    fontSize: 14,
    fontWeight: 700,
    margin: '0 0 10px 0',
    color: '#3B2D2B',
  },
  guideList: {
    paddingLeft: 20,
    margin: 0,
    fontSize: 12,
    color: '#5C4A48',
    lineHeight: 1.6,
  },
  footer: {
    padding: '16px 32px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #F0E4DE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipBtn: {
    background: 'none',
    border: 'none',
    color: '#A89997',
    fontSize: 13,
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  backBtn: {
    padding: '10px 18px',
    borderRadius: 10,
    border: '1px solid #EBDAD4',
    backgroundColor: '#FFFFFF',
    color: '#5C4A48',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  nextBtn: {
    padding: '10px 22px',
    borderRadius: 10,
    border: 'none',
    backgroundColor: '#FF8866',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  finishBtn: {
    padding: '10px 24px',
    borderRadius: 10,
    border: 'none',
    backgroundColor: '#FF6644',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(255, 102, 68, 0.3)',
  },
};

