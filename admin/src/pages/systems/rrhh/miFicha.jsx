import React, { useState } from 'react';
import { 
  X, 
  User, 
  FileText, 
  Folder, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  UploadCloud, 
  Plus, 
  Sun, 
  Moon 
} from 'lucide-react';

export default function NuevoExpedienteModal({ isOpen = true, onClose }) {
  // Estado para el Modo Oscuro / Claro
  const [darkMode, setDarkMode] = useState(false);

  // Estado para controlar qué sección está abierta
  const [openSection, setOpenSection] = useState('identificacion');

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (!isOpen) return null;

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        
        {/* Modal Container */}
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transition-colors duration-300 border border-slate-200 dark:border-slate-800">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
              <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                Nuevo Expediente
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Botón Switch Modo Claro / Oscuro */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
                title="Cambiar Tema"
              >
                {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
              </button>
              
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form Content / Body */}
          <div className="p-6 overflow-y-auto space-y-4">
            
            {/* 1. IDENTIFICACIÓN */}
            <AccordionItem
              id="identificacion"
              title="Identificación"
              icon={<User size={18} />}
              isOpen={openSection === 'identificacion'}
              onToggle={() => toggleSection('identificacion')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-style">Tipo de Documento</label>
                  <select className="input-style">
                    <option value="">Seleccione...</option>
                    <option value="V">Venezolano (V)</option>
                    <option value="E">Extranjero (E)</option>
                    <option value="J">Jurídico (J)</option>
                  </select>
                </div>
                <div>
                  <label className="label-style">Número de Identificación</label>
                  <input type="text" placeholder="Ej: 12345678" className="input-style" />
                </div>
              </div>
            </AccordionItem>

            {/* 2. DOCUMENTOS LEGALES */}
            <AccordionItem
              id="documentos"
              title="Documentos Legales"
              icon={<FileText size={18} />}
              isOpen={openSection === 'documentos'}
              onToggle={() => toggleSection('documentos')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-style">C.I.</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">F. VENC. C.I.</label>
                  <input type="date" className="input-style" />
                </div>

                <div>
                  <label className="label-style">RIF</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">F. VENC. RIF</label>
                  <input type="date" className="input-style" />
                </div>

                <div>
                  <label className="label-style">CONTRATO</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">F. VENC. CONTRATO</label>
                  <input type="date" className="input-style" />
                </div>
              </div>
            </AccordionItem>

            {/* 3. RECAUDOS Y ACADÉMICOS */}
            <AccordionItem
              id="recaudos"
              title="Recaudos y Académicos"
              icon={<Folder size={18} />}
              isOpen={openSection === 'recaudos'}
              onToggle={() => toggleSection('recaudos')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-style">FT. CARNET</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">REF. PERS.</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>

                <div>
                  <label className="label-style">COMPR. DOMICILIO</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">ACDO. CONFIDENCIALIDAD</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>

                <div>
                  <label className="label-style">CV</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">CERT. ESTUDIOS</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>

                <div>
                  <label className="label-style">CERT. CAPACITACIÓN</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">ACEPT. CAP. GRAL.</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>

                <div>
                  <label className="label-style">ACEPT. CAP. ÁREA</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">CAP. CUMPLIDAS</label>
                  <input type="number" defaultValue={0} className="input-style" />
                </div>

                <div className="md:col-span-1">
                  <label className="label-style">OTROS CURSOS</label>
                  <input type="number" defaultValue={0} className="input-style" />
                </div>
              </div>
            </AccordionItem>

            {/* 4. OPERATIVOS / SEGURIDAD SOCIAL */}
            <AccordionItem
              id="operativos"
              title="Operativos / Seguridad Social"
              icon={<Settings size={18} />}
              isOpen={openSection === 'operativos'}
              onToggle={() => toggleSection('operativos')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-style">IVSS</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">F. REG. IVSS</label>
                  <input type="date" className="input-style" />
                </div>

                <div>
                  <label className="label-style">INCE</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">F. REG. INCE</label>
                  <input type="date" className="input-style" />
                </div>

                <div>
                  <label className="label-style">FAOV</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">F. REG. FAOV</label>
                  <input type="date" className="input-style" />
                </div>

                <div>
                  <label className="label-style">CST. MÉDICA</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">REPOSOS</label>
                  <input type="number" defaultValue={0} className="input-style" />
                </div>

                <div>
                  <label className="label-style">VACACIONES</label>
                  <input type="number" defaultValue={0} className="input-style" />
                </div>
                <div>
                  <label className="label-style">PERMISOS</label>
                  <input type="number" defaultValue={0} className="input-style" />
                </div>

                <div>
                  <label className="label-style">AMONESTACIONES</label>
                  <select className="input-style"><option value="">Seleccione...</option></select>
                </div>
                <div>
                  <label className="label-style">CANT. AMON.</label>
                  <input type="number" defaultValue={0} className="input-style" />
                </div>
              </div>
            </AccordionItem>

            {/* 5. SOPORTES DIGITALES */}
            <AccordionItem
              id="soportes"
              title="Soportes Digitales"
              icon={<FileText size={18} />}
              isOpen={openSection === 'soportes'}
              onToggle={() => toggleSection('soportes')}
            >
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Arrastra archivos o selecciona para adjuntar.
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer shadow-sm transition-all">
                  <Plus size={16} />
                  <span>Seleccionar Archivos</span>
                  <input type="file" multiple className="hidden" />
                </label>
              </div>
            </AccordionItem>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              className="px-5 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 rounded-lg shadow-sm transition-all"
            >
              Guardar Expediente
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* Componente Auxiliar para las secciones Acordeón */
function AccordionItem({ title, icon, children, isOpen, onToggle }) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden transition-colors">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-medium transition-colors ${
          isOpen
            ? 'bg-slate-100/80 dark:bg-slate-800/80 text-orange-600 dark:text-orange-400'
            : 'bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={isOpen ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}>
            {icon}
          </span>
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-orange-500" />
        ) : (
          <ChevronDown size={18} className="text-slate-400 dark:text-slate-500" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors">
          {children}
        </div>
      )}
    </div>
  );
}