// ============================================================
// Mochi – Pet Room View (Cozy Bento-Grid Settings UI)
// ============================================================
import React, { useState } from 'react';
import type { AppSettings, PetData, AccessoryId, ToyId, PersonalityPreset } from '../../shared/types';
import { PERSONALITY_PRESETS } from '../../shared/constants';

interface PetRoomViewProps {
  settings: AppSettings;
  petData: PetData | null;
  onSettingsChange: (partial: Partial<AppSettings>) => void;
  onPetDataChange: (partial: Partial<PetData>) => void;
}

const ACCESSORIES_LIST: { id: AccessoryId; name: string; icon: string }[] = [
  { id: 'none', name: 'None', icon: '🐾' },
  { id: 'bow', name: 'Cute Bow', icon: '🎀' },
  { id: 'bell_collar', name: 'Bell Collar', icon: '🔔' },
  { id: 'flower_crown', name: 'Flower Crown', icon: '🌸' },
  { id: 'glasses', name: 'Smart Glasses', icon: '👓' },
  { id: 'hoodie', name: 'Tiny Hoodie', icon: '🧥' },
  { id: 'witch_hat', name: 'Witch Hat', icon: '🧙' },
  { id: 'scarf', name: 'Cozy Scarf', icon: '🧣' },
  { id: 'nightcap', name: 'Nightcap', icon: '🌙' },
  { id: 'backpack', name: 'Mini Backpack', icon: '🎒' },
];

const TOYS_LIST: { id: ToyId; name: string; icon: string; desc: string }[] = [
  { id: 'yarn_ball', name: 'Yarn Ball', icon: '🧶', desc: 'Rolls around bouncy' },
  { id: 'laser_dot', name: 'Laser Pointer', icon: '🔴', desc: 'Mochi loves to chase this' },
  { id: 'bouncing_ball', name: 'Bouncy Ball', icon: '🎾', desc: 'Bounces high on screen' },
  { id: 'plush_mouse', name: 'Plush Mouse', icon: '🐭', desc: 'Soft & chewable' },
  { id: 'feather_wand', name: 'Feather Wand', icon: '🪶', desc: 'Fluttering bird toy' },
  { id: 'fish_plush', name: 'Fish Toy', icon: '🐟', desc: 'Tasty looking plush' },
  { id: 'cardboard_box', name: 'Cardboard Box', icon: '📦', desc: 'If it fits, Mochi sits' },
  { id: 'cushion', name: 'Soft Pillow', icon: '🛋️', desc: 'Comfy rest spot' },
];

export const PetRoomView: React.FC<PetRoomViewProps> = ({
  settings,
  petData,
  onSettingsChange,
  onPetDataChange,
}) => {
  const [activeTab, setActiveTab] = useState<'pet' | 'behavior' | 'appearance' | 'system'>('pet');
  const [nameInput, setNameInput] = useState(petData?.name || 'Mochi');

  if (!petData) return <div style={styles.center}>Loading pet data...</div>;

  const handleNameSave = () => {
    if (nameInput.trim()) {
      onPetDataChange({ name: nameInput.trim() });
    }
  };

  const handlePersonalityChange = (preset: PersonalityPreset) => {
    const config = PERSONALITY_PRESETS[preset] || PERSONALITY_PRESETS.playful;
    onPetDataChange({
      personality: config,
    });
  };

  const toggleAccessory = (accId: AccessoryId) => {
    const current = petData.appearance.accessories || [];
    let updated: AccessoryId[];
    if (accId === 'none') {
      updated = [];
    } else if (current.includes(accId)) {
      updated = current.filter((a) => a !== accId);
    } else {
      updated = [...current, accId];
    }
    onPetDataChange({
      appearance: {
        ...petData.appearance,
        accessories: updated,
      },
    });
  };

  const handleSpawnToy = (toyId: ToyId) => {
    window.mochiAPI.invoke('pet:spawn-toy', { toyId }).catch(() => {});
  };

  const handleGiveTreat = () => {
    window.mochiAPI.invoke('pet:summon-treat').catch(() => {});
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerEmoji}>🐱</span>
          <div>
            <h1 style={styles.headerTitle}>Mochi's Pet Room</h1>
            <p style={styles.headerSubtitle}>Customize your desktop companion & workspace settings</p>
          </div>
        </div>
        <div style={styles.navTabs}>
          {(['pet', 'appearance', 'behavior', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : {}),
              }}
            >
              {tab === 'pet' && '🐾 Pet Care'}
              {tab === 'appearance' && '🎨 Appearance'}
              {tab === 'behavior' && '🧠 Behavior'}
              {tab === 'system' && '⚙️ Settings'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <div style={styles.content}>
        {activeTab === 'pet' && (
          <div style={styles.bentoGrid}>
            {/* Bento Card: Pet Identity */}
            <div style={{ ...styles.card, gridColumn: 'span 2' }}>
              <h2 style={styles.cardTitle}>🐾 Companion Identity</h2>
              <div style={styles.row}>
                <div style={styles.avatarPreview}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      backgroundColor: petData.appearance.furColor,
                      border: `4px solid ${petData.appearance.patchColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 40,
                    }}
                  >
                    🐱
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Cat Name</label>
                  <div style={styles.inputGroup}>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      style={styles.input}
                    />
                    <button onClick={handleNameSave} style={styles.actionBtn}>
                      Save
                    </button>
                  </div>
                  <p style={styles.hint}>Trust Level: {Math.round(petData.trustLevel)}% • Total Pets: {petData.totalPetCount}</p>
                </div>
              </div>

              {/* Vitals & Emotions */}
              <div style={{ marginTop: 16 }}>
                <h3 style={styles.sectionHeading}>Current Vitals</h3>
                <div style={styles.statsGrid}>
                  <div style={styles.statBox}>
                    <span style={styles.statLabel}>⚡ Energy</span>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${petData.vitals.energy}%`, background: '#FFA07A' }} />
                    </div>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statLabel}>🎾 Playfulness</span>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${petData.vitals.playfulness}%`, background: '#98FB98' }} />
                    </div>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statLabel}>💖 Affection</span>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${petData.emotions.affection}%`, background: '#FFB6C1' }} />
                    </div>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statLabel}>✨ Happiness</span>
                    <div style={styles.progressBar}>
                      <div style={{ ...styles.progressFill, width: `${petData.emotions.happiness}%`, background: '#87CEFA' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Card: Quick Actions */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>✨ Quick Actions</h2>
              <div style={styles.buttonList}>
                <button onClick={handleGiveTreat} style={styles.bigActionBtn}>
                  <span>🐟</span>
                  <span>Give Yummy Treat</span>
                </button>
                <button
                  onClick={() => window.mochiAPI.invoke('pet:pet-action').catch(() => {})}
                  style={styles.bigActionBtn}
                >
                  <span>👋</span>
                  <span>Pet Gentle Stroke</span>
                </button>
                <button
                  onClick={() => window.mochiAPI.invoke('pet:recover').catch(() => {})}
                  style={{ ...styles.bigActionBtn, backgroundColor: '#FFF0F5' }}
                >
                  <span>🛟</span>
                  <span>Recover Stuck Cat</span>
                </button>
              </div>
            </div>

            {/* Bento Card: Toy Box */}
            <div style={{ ...styles.card, gridColumn: 'span 3' }}>
              <h2 style={styles.cardTitle}>🎾 Toy Collection (Click to Drop on Desktop)</h2>
              <div style={styles.toyGrid}>
                {TOYS_LIST.map((toy) => (
                  <div
                    key={toy.id}
                    onClick={() => handleSpawnToy(toy.id)}
                    style={styles.toyCard}
                  >
                    <span style={styles.toyIcon}>{toy.icon}</span>
                    <span style={styles.toyName}>{toy.name}</span>
                    <span style={styles.toyDesc}>{toy.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div style={styles.bentoGrid}>
            {/* Fur & Eyes */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🎨 Fur & Eyes Color</h2>
              <div style={styles.formRow}>
                <label style={styles.label}>Primary Fur Color:</label>
                <input
                  type="color"
                  value={petData.appearance.furColor}
                  onChange={(e) =>
                    onPetDataChange({
                      appearance: { ...petData.appearance, furColor: e.target.value },
                    })
                  }
                  style={styles.colorPicker}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Patch Color:</label>
                <input
                  type="color"
                  value={petData.appearance.patchColor}
                  onChange={(e) =>
                    onPetDataChange({
                      appearance: { ...petData.appearance, patchColor: e.target.value },
                    })
                  }
                  style={styles.colorPicker}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Eye Color:</label>
                <input
                  type="color"
                  value={petData.appearance.eyeColor}
                  onChange={(e) =>
                    onPetDataChange({
                      appearance: { ...petData.appearance, eyeColor: e.target.value },
                    })
                  }
                  style={styles.colorPicker}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Cat Scale: ({petData.appearance.size.toFixed(1)}x)</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={petData.appearance.size}
                  onChange={(e) =>
                    onPetDataChange({
                      appearance: { ...petData.appearance, size: parseFloat(e.target.value) },
                    })
                  }
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Accessories */}
            <div style={{ ...styles.card, gridColumn: 'span 2' }}>
              <h2 style={styles.cardTitle}>🎀 Dress-Up Accessories</h2>
              <div style={styles.accessoryGrid}>
                {ACCESSORIES_LIST.map((acc) => {
                  const isSelected =
                    acc.id === 'none'
                      ? (petData.appearance.accessories || []).length === 0
                      : (petData.appearance.accessories || []).includes(acc.id);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleAccessory(acc.id)}
                      style={{
                        ...styles.accessoryCard,
                        ...(isSelected ? styles.accessorySelected : {}),
                      }}
                    >
                      <span style={{ fontSize: 28 }}>{acc.icon}</span>
                      <span style={styles.accessoryName}>{acc.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'behavior' && (
          <div style={styles.bentoGrid}>
            {/* Personality Presets */}
            <div style={{ ...styles.card, gridColumn: 'span 2' }}>
              <h2 style={styles.cardTitle}>🐱 Personality Archetype</h2>
              <div style={styles.personalityGrid}>
                {(['playful', 'cuddly', 'curious', 'sleepy', 'chaotic', 'shy', 'independent'] as PersonalityPreset[]).map(
                  (preset) => {
                    const active = petData.personality.preset === preset;
                    return (
                      <div
                        key={preset}
                        onClick={() => handlePersonalityChange(preset)}
                        style={{
                          ...styles.presetCard,
                          ...(active ? styles.presetCardActive : {}),
                        }}
                      >
                        <h4 style={styles.presetTitle}>
                          {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </h4>
                        <p style={styles.presetDesc}>
                          {preset === 'cuddly' && 'Loves staying close, gentle purrs, and frequent naps.'}
                          {preset === 'playful' && 'High energy, loves cursor chasing and toy pounces.'}
                          {preset === 'curious' && 'Explores every corner, sniffs and watches windows.'}
                          {preset === 'sleepy' && 'Quiet, calm, mostly naps next to your active windows.'}
                          {preset === 'chaotic' && 'Zoomies, tail-chasing, and spontaneous antics!'}
                          {preset === 'shy' && 'Cautious approaches, hides if startled, takes time.'}
                          {preset === 'independent' && 'Self-reliant explorer who does their own thing.'}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Work & Focus Modes */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>💼 Cozy Work Modes</h2>
              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Work Mode</span>
                  <p style={styles.hint}>Mochi sits quietly near edges and avoids controls</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.workMode}
                  onChange={(e) => onSettingsChange({ workMode: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>

              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Focus Mode</span>
                  <p style={styles.hint}>Sleeps peacefully, fully muted, minimal movement</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.focusMode}
                  onChange={(e) => onSettingsChange({ focusMode: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>

              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Cursor Tracking</span>
                  <p style={styles.hint}>Cat eyes and head follow the mouse pointer</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.cursorTracking}
                  onChange={(e) => onSettingsChange({ cursorTracking: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>

              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Click-Through Mode</span>
                  <p style={styles.hint}>Mouse clicks pass through to apps underneath</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.clickThrough}
                  onChange={(e) => onSettingsChange({ clickThrough: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div style={styles.bentoGrid}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🔊 Audio & Voice</h2>
              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Enable Sounds</span>
                  <p style={styles.hint}>Meows, purrs, yawning & footsteps</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onSettingsChange({ soundEnabled: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label style={styles.label}>
                  Sound Volume ({Math.round(settings.soundVolume * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => onSettingsChange({ soundVolume: parseFloat(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>⚡ Performance & Display</h2>
              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Always On Top</span>
                  <p style={styles.hint}>Keep Mochi visible above windows</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.alwaysOnTop}
                  onChange={(e) => onSettingsChange({ alwaysOnTop: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>
              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Low Power Mode</span>
                  <p style={styles.hint}>Reduces FPS to save laptop battery</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.lowPowerMode}
                  onChange={(e) => onSettingsChange({ lowPowerMode: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>
              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Gentle Crying / Distress</span>
                  <p style={styles.hint}>Shows cartoon tears if petted too roughly</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.cryingEnabled}
                  onChange={(e) => onSettingsChange({ cryingEnabled: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>
            </div>

            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🚀 Startup & System</h2>
              <div style={styles.toggleRow}>
                <div>
                  <span style={styles.toggleLabel}>Launch on Windows Startup</span>
                  <p style={styles.hint}>Starts automatically when your PC boots</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.startWithWindows}
                  onChange={(e) => onSettingsChange({ startWithWindows: e.target.checked })}
                  style={styles.checkbox}
                />
              </div>
              <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
                <button
                  onClick={() => window.mochiAPI.invoke('petdata:reset').catch(() => {})}
                  style={{ ...styles.actionBtn, backgroundColor: '#FFD1D1', color: '#900' }}
                >
                  Reset Pet Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#FFF9F5',
    color: '#4A3E3D',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    overflow: 'hidden',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#8A7A78',
  },
  header: {
    padding: '16px 28px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #F0E4DE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  headerEmoji: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
    color: '#3B2F2F',
  },
  headerSubtitle: {
    fontSize: 12,
    margin: 0,
    color: '#8A7A78',
  },
  navTabs: {
    display: 'flex',
    gap: 8,
  },
  tabBtn: {
    padding: '8px 16px',
    borderRadius: 20,
    border: '1px solid transparent',
    backgroundColor: '#F8EFEA',
    color: '#6E5D5B',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabBtnActive: {
    backgroundColor: '#FF8866',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    overflowY: 'auto',
  },
  bentoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    maxWidth: 1100,
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 4px 14px rgba(180, 150, 140, 0.08)',
    border: '1px solid #F2E8E4',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 14,
    color: '#4A3B39',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  avatarPreview: {
    flexShrink: 0,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#7D6B69',
    marginBottom: 4,
  },
  inputGroup: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #E5D5CF',
    fontSize: 14,
    outline: 'none',
  },
  actionBtn: {
    padding: '8px 16px',
    backgroundColor: '#FF8866',
    color: '#FFF',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
  },
  hint: {
    fontSize: 11,
    color: '#A89997',
    marginTop: 4,
    margin: 0,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 600,
    color: '#6B5856',
    marginBottom: 8,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  statBox: {
    backgroundColor: '#FDF7F4',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #F5EAE5',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#6E5D5B',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#EBE0DA',
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  buttonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  bigActionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 16px',
    backgroundColor: '#FFF6F2',
    border: '1px solid #FCE4D8',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    color: '#4B3C3A',
    cursor: 'pointer',
    transition: 'transform 0.1s, background-color 0.2s',
  },
  toyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
  },
  toyCard: {
    backgroundColor: '#FAF2ED',
    border: '1px solid #EEDDD5',
    borderRadius: 12,
    padding: 14,
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    transition: 'transform 0.15s, box-shadow 0.15s',
  },
  toyIcon: {
    fontSize: 30,
  },
  toyName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#4B3C3A',
  },
  toyDesc: {
    fontSize: 10,
    color: '#9C8C8A',
  },
  formRow: {
    marginBottom: 12,
  },
  colorPicker: {
    width: 44,
    height: 34,
    border: 'none',
    cursor: 'pointer',
    borderRadius: 6,
  },
  accessoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
  },
  accessoryCard: {
    backgroundColor: '#FBF5F2',
    border: '2px solid transparent',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    cursor: 'pointer',
  },
  accessorySelected: {
    borderColor: '#FF8866',
    backgroundColor: '#FFF2EE',
  },
  accessoryName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#4A3E3D',
  },
  personalityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },
  presetCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FBF5F2',
    border: '1px solid #ECE0DA',
    cursor: 'pointer',
  },
  presetCardActive: {
    borderColor: '#FF8866',
    backgroundColor: '#FFF2EE',
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: 700,
    margin: '0 0 4px 0',
    color: '#3B2F2F',
  },
  presetDesc: {
    fontSize: 11,
    color: '#7C6C6A',
    margin: 0,
    lineHeight: 1.3,
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #F5ECE8',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: '#4A3E3D',
  },
  checkbox: {
    width: 18,
    height: 18,
    accentColor: '#FF8866',
    cursor: 'pointer',
  },
};

