import React, { useState, useEffect } from 'react';
import { X, Check, Crown, Trash2, Feather, Swords, Shield } from 'lucide-react';
import { Player, PlayerStatus, PlayerRole } from '../types';
import { JOB_CLASSES } from '../constants/classes';
import { ClassIcon } from './ClassIcon';
import { useTheme } from '../context/ThemeContext';

interface EditPlayerModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Player) => void;
  onDelete?: () => void;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { isParchment } = useTheme();
  const [name, setName] = useState('');
  const [jobClass, setJobClass] = useState('Atirador de Elite');
  const [level, setLevel] = useState(99);
  const [status, setStatus] = useState<PlayerStatus>('Online');
  const [role, setRole] = useState<PlayerRole>('DPS');
  const [isLeader, setIsLeader] = useState(false);
  const [featherLevel, setFeatherLevel] = useState('');
  const [power, setPower] = useState('');
  const [glory, setGlory] = useState('');
  const [mountLevel, setMountLevel] = useState('');

  useEffect(() => {
    if (player) {
      setName(player.name);
      setJobClass(player.jobClass);
      setLevel(player.level);
      setStatus(player.status);
      setRole(player.role);
      setIsLeader(Boolean(player.isLeader));
      setFeatherLevel(player.featherLevel !== undefined ? String(player.featherLevel) : '');
      setPower(
        player.power !== undefined
          ? String(player.power)
          : player.powerAndGlory !== undefined
          ? String(player.powerAndGlory)
          : ''
      );
      setGlory(player.glory !== undefined ? String(player.glory) : '');
      setMountLevel(player.mountLevel !== undefined ? String(player.mountLevel) : '');
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      ...player,
      name: name.trim(),
      jobClass,
      level: Number(level) || 99,
      status,
      role,
      isLeader,
      featherLevel: featherLevel.trim() ? (isNaN(Number(featherLevel.trim())) ? featherLevel.trim() : Number(featherLevel.trim())) : undefined,
      power: power.trim() || undefined,
      glory: glory.trim() || undefined,
      mountLevel: mountLevel.trim() ? (isNaN(Number(mountLevel.trim())) ? mountLevel.trim() : Number(mountLevel.trim())) : undefined,
    });
    onClose();
  };

  const handleClassChange = (selectedClassName: string) => {
    setJobClass(selectedClassName);
    const found = JOB_CLASSES.find((c) => c.name === selectedClassName);
    if (found) {
      setRole(found.role);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto border ${
          isParchment
            ? 'parchment-card border-[#c09761] text-[#3d2008]'
            : 'bg-slate-900 border-slate-700 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 sm:px-5 py-3 sm:py-4 border-b flex items-center justify-between shrink-0 ${
            isParchment
              ? 'bg-[#ecd8b5] border-[#c09761]'
              : 'bg-gradient-to-r from-blue-900/60 to-slate-800 border-slate-700/80'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                isParchment
                  ? 'bg-[#ecd1a7] border-[#b8860b] text-[#7a4417]'
                  : 'bg-blue-600/30 border-blue-500/40 text-blue-400'
              }`}
            >
              <ClassIcon name={jobClass} size={18} />
            </div>
            <div className="min-w-0">
              <h3
                className={`text-sm sm:text-base font-bold truncate ${
                  isParchment ? 'text-[#3b1f06] font-serif' : 'text-white'
                }`}
              >
                Editar Jogador
              </h3>
              <p
                className={`text-[11px] sm:text-xs truncate ${
                  isParchment ? 'text-[#7d532b]' : 'text-slate-400'
                }`}
              >
                Modifique o nick, classe e status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ml-2 ${
              isParchment
                ? 'hover:bg-[#dfc49c] text-[#7d532b] hover:text-[#3d2008]'
                : 'hover:bg-slate-700/80 text-slate-400 hover:text-white'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {/* Nick / Name */}
          <div>
            <label
              className={`block text-xs font-bold mb-1 ${
                isParchment ? 'text-[#5a3311]' : 'text-slate-300'
              }`}
            >
              Nick / Nome do Personagem
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              placeholder="Digite o nick do jogador..."
              className={`w-full text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-hidden ${
                isParchment
                  ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] placeholder-[#a68662] focus:border-[#7a4417]'
                  : 'bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
              }`}
              required
            />
          </div>

          {/* Job Class & Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  isParchment ? 'text-[#5a3311]' : 'text-slate-300'
                }`}
              >
                Classe / Job
              </label>
              <select
                value={jobClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className={`w-full text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-hidden ${
                  isParchment
                    ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                    : 'bg-slate-950 border border-slate-700 text-slate-200 focus:border-blue-500'
                }`}
              >
                {JOB_CLASSES.map((jc) => (
                  <option key={jc.id} value={jc.name}>
                    {jc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  isParchment ? 'text-[#5a3311]' : 'text-slate-300'
                }`}
              >
                Função Tática
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as PlayerRole)}
                className={`w-full text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-hidden ${
                  isParchment
                    ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                    : 'bg-slate-950 border border-slate-700 text-slate-200 focus:border-blue-500'
                }`}
              >
                <option value="DPS">DPS (Dano)</option>
                <option value="Tank">Tank (Linha de frente)</option>
                <option value="Healer">Healer (Cura)</option>
                <option value="Suporte">Suporte / Buff</option>
              </select>
            </div>
          </div>

          {/* Level & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  isParchment ? 'text-[#5a3311]' : 'text-slate-300'
                }`}
              >
                Nível (Base)
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                className={`w-full text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-hidden ${
                  isParchment
                    ? 'bg-[#fffcf4] border border-[#c29c67] text-[#92400e] focus:border-[#7a4417]'
                    : 'bg-slate-950 border border-slate-700 text-amber-400 focus:border-blue-500'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  isParchment ? 'text-[#5a3311]' : 'text-slate-300'
                }`}
              >
                Status de Presença
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlayerStatus)}
                className={`w-full text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-hidden ${
                  isParchment
                    ? 'bg-[#fffcf4] border border-[#c29c67] text-[#4d2807] focus:border-[#7a4417]'
                    : 'bg-slate-950 border border-slate-700 text-slate-200 focus:border-blue-500'
                }`}
              >
                <option value="Online">Online</option>
                <option value="Ausente">Ausente</option>
                <option value="Longe">Longe</option>
                <option value="Líder">Líder</option>
              </select>
            </div>
          </div>

          {/* Atributos: Nível de Penas, Poder, Glória, Nível da Montaria */}
          <div className="pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label
                  className={`block text-[11px] font-bold mb-1 truncate ${
                    isParchment ? 'text-[#5a3311]' : 'text-slate-300'
                  }`}
                  title="Nível de Penas"
                >
                  🪶 Nv. Penas
                </label>
                <input
                  type="text"
                  value={featherLevel}
                  onChange={(e) => setFeatherLevel(e.target.value)}
                  placeholder="Ex: 18"
                  className={`w-full text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-hidden ${
                    isParchment
                      ? 'bg-[#fffcf4] border border-[#c29c67] text-[#0e5c70] placeholder-[#a68662] focus:border-[#7a4417]'
                      : 'bg-slate-950 border border-slate-700 text-sky-300 placeholder-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold mb-1 truncate ${
                    isParchment ? 'text-[#5a3311]' : 'text-slate-300'
                  }`}
                  title="Poder"
                >
                  ⚔️ Poder
                </label>
                <input
                  type="text"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="Ex: 450k"
                  className={`w-full text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-hidden ${
                    isParchment
                      ? 'bg-[#fffcf4] border border-[#c29c67] text-[#92400e] placeholder-[#a68662] focus:border-[#7a4417]'
                      : 'bg-slate-950 border border-slate-700 text-amber-300 placeholder-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold mb-1 truncate ${
                    isParchment ? 'text-[#5a3311]' : 'text-slate-300'
                  }`}
                  title="Glória"
                >
                  ⚜️ Glória
                </label>
                <input
                  type="text"
                  value={glory}
                  onChange={(e) => setGlory(e.target.value)}
                  placeholder="Ex: 25"
                  className={`w-full text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-hidden ${
                    isParchment
                      ? 'bg-[#fffcf4] border border-[#c29c67] text-[#6b21a8] placeholder-[#a68662] focus:border-[#7a4417]'
                      : 'bg-slate-950 border border-slate-700 text-purple-300 placeholder-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-[11px] font-bold mb-1 truncate ${
                    isParchment ? 'text-[#5a3311]' : 'text-slate-300'
                  }`}
                  title="Nível da Montaria"
                >
                  🐎 Nv. Montaria
                </label>
                <input
                  type="text"
                  value={mountLevel}
                  onChange={(e) => setMountLevel(e.target.value)}
                  placeholder="Ex: 20"
                  className={`w-full text-xs font-bold rounded-xl px-2.5 py-2 focus:outline-hidden ${
                    isParchment
                      ? 'bg-[#fffcf4] border border-[#c29c67] text-[#166534] placeholder-[#a68662] focus:border-[#7a4417]'
                      : 'bg-slate-950 border border-slate-700 text-emerald-300 placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Leader Toggle */}
          <div className="pt-2">
            <label
              className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-colors ${
                isParchment
                  ? 'bg-[#f7ebda] hover:bg-[#fff9ef] border-[#cbb085]'
                  : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80'
              }`}
            >
              <input
                type="checkbox"
                checked={isLeader}
                onChange={(e) => setIsLeader(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  isParchment ? 'text-[#4d2807]' : 'text-slate-200'
                }`}
              >
                <Crown size={14} className={isParchment ? 'text-[#b45309]' : 'text-amber-400'} />
                Definir como Líder de Time
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div
            className={`pt-4 flex items-center justify-between border-t ${
              isParchment ? 'border-[#cbb085]' : 'border-slate-800'
            }`}
          >
            {onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isParchment
                    ? 'text-rose-800 hover:bg-rose-100 border-rose-300'
                    : 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border-rose-900/60'
                }`}
              >
                <Trash2 size={13} />
                Remover
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  isParchment
                    ? 'text-[#69421c] hover:bg-[#eedbc0]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                  isParchment
                    ? 'bg-gradient-to-r from-[#7a4417] to-[#9c5b23] hover:brightness-110 border border-[#c5994f]'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/30'
                }`}
              >
                <Check size={14} />
                Salvar Alterações
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
