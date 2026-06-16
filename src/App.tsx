import React, { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { 
  Wrench, Users, LogOut, Sun, Moon, Search, ChevronRight, 
  Eye, EyeOff, Mail, Lock, User as UserIcon 
} from 'lucide-react';
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, writeBatch,
  getDoc, setDoc 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Configuración y Tipos
import { db, auth, appId } from './firebase';
import type { 
  ToolItem, Loan, Engineer, ConsumableItem, ConsumableLog, 
  UserRole, EditLogEntry, ToolComponent, LoanRequest
} from './tipos';

// Utilidades
import { 
  fileToBase64, exportToCSV, generateInventoryPDF, 
  generateReportPDF, generateLoanPDF, generateQRUrl 
} from './utilidades';

// Componentes
import { BarraLateral } from './componentes/BarraLateral';
import { TabPanelControl } from './componentes/TabPanelControl';
import { TabInventario } from './componentes/TabInventario';
import { TabPrestamos } from './componentes/TabPrestamos';
import { TabConsumibles } from './componentes/TabConsumibles';
import { TabPersonal } from './componentes/TabPersonal';
import { TabCalibraciones } from './componentes/TabCalibraciones';
import { TabReportes } from './componentes/TabReportes';
import { TabSolicitudes } from './componentes/TabSolicitudes';
import { TabMisSolicitudes } from './componentes/TabMisSolicitudes';

// Modales
import { ModalDetalleActivo } from './componentes/modales/ModalDetalleActivo';
import { ModalImpresionQR } from './componentes/modales/ModalImpresionQR';
import { ModalAlertaActiva } from './componentes/modales/ModalAlertaActiva';
import { ModalDevolucion } from './componentes/modales/ModalDevolucion';
import { ModalConfirmarPrestamo } from './componentes/modales/ModalConfirmarPrestamo';
import { ModalFormularioActivo } from './componentes/modales/ModalFormularioActivo';
import { ModalEmisionPrestamo } from './componentes/modales/ModalEmisionPrestamo';
import { ModalFormularioConsumible } from './componentes/modales/ModalFormularioConsumible';
import { ModalDespachoConsumible } from './componentes/modales/ModalDespachoConsumible';
import { ModalDetalleIngeniero } from './componentes/modales/ModalDetalleIngeniero';
import { ModalFormularioIngeniero } from './componentes/modales/ModalFormularioIngeniero';
import { ModalImportarCSV } from './componentes/modales/ModalImportarCSV';
import { ModalFormularioSolicitud } from './componentes/modales/ModalFormularioSolicitud';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex items-center justify-center flex-col bg-slate-50">
          <h1 className="text-xl font-medium text-slate-800 mb-4">Ha ocurrido un error inesperado.</h1>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            Recargar Aplicación
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function BodegaContent() {
  const [user, setUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [appUser, setAppUser] = useState<{ name: string, role: UserRole } | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  // Signup State
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [signupName, setSignupName] = useState<string>('');
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [signupRole, setSignupRole] = useState<UserRole>('bodeguero');
  
  // Auth status
  const [authError, setAuthError] = useState<string>('');
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [tools, setTools] = useState<ToolItem[]>([]);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [consumables, setConsumables] = useState<ConsumableItem[]>([]);
  const [consumableLogs, setConsumableLogs] = useState<ConsumableLog[]>([]);
  
  // Solicitudes de Préstamo
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>([]);
  const [selectedRequestTools, setSelectedRequestTools] = useState<ToolItem[]>([]);
  const [showSolicitudModal, setShowSolicitudModal] = useState<boolean>(false);

  const [alerts, setAlerts] = useState<{ message: string, type: 'calibration' | 'loan' | 'stock', id?: string, loanId?: string, consumableId?: string }[]>([]);
  const [alertModal, setAlertModal] = useState<{ message: string, type: 'calibration' | 'loan' | 'stock', id?: string, loanId?: string, consumableId?: string } | null>(null);

  // Modo Oscuro
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    return () => document.documentElement.removeAttribute('data-theme');
  }, [darkMode]);

  // Búsqueda global
  const [globalSearch, setGlobalSearch] = useState('');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // Filtros y estados del Préstamo
  const [loanFilter, setLoanFilter] = useState<'ALL' | 'active' | 'returned'>('ALL');
  const [loanConfirmStep, setLoanConfirmStep] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnLoan, setReturnLoan] = useState<Loan | null>(null);
  const [selectedReturnTools, setSelectedReturnTools] = useState<string[]>([]);
  const [returnCondition, setReturnCondition] = useState<string>('Bueno');
  const [returnNotes, setReturnNotes] = useState<string>('');

  // Selector de Ingenieros en préstamos
  const [engineerSelectorOpen, setEngineerSelectorOpen] = useState(false);
  const [engineerSelectorSearch, setEngineerSelectorSearch] = useState('');

  // Historial de actividad
  const [activityLog, setActivityLog] = useState<{ icon: string, text: string, time: Date, user: string }[]>([]);

  // Paginador del Inventario
  const [inventoryPage, setInventoryPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Toasts
  const [toasts, setToasts] = useState<{ id: number, msg: string, type: 'success' | 'error' | 'info' }[]>([]);
  const addToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  // Importar CSV
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Calendario
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Historial de ediciones
  const [editHistory, setEditHistory] = useState<{ [toolId: string]: EditLogEntry[] }>({});
  const shortcutsEnabled = useRef(true);

  // Zoom de la aplicación
  const [appZoom, setAppZoom] = useState<number>(1);

  // Visibilidad de Modales
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showEngineerModal, setShowEngineerModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showConsumableModal, setShowConsumableModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showEngineerDetailsModal, setShowEngineerDetailsModal] = useState(false);
  const [isEditingTool, setIsEditingTool] = useState(false);

  const [filterABC, setFilterABC] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [modalTab, setModalTab] = useState<'general' | 'maintenance' | 'history' | 'components'>('general');
  const [newComponent, setNewComponent] = useState<Partial<ToolComponent>>({
    orimec: '', name: '', serial: '', pnGE: '', quantity: 1, modalidad: 'Todas', estado: 'Operativa'
  });
  const [engineerModalTab, setEngineerModalTab] = useState<'loans' | 'consumables'>('loans');
  const [loanSearch, setLoanSearch] = useState('');
  const [loanDateFrom, setLoanDateFrom] = useState('');
  const [loanDateTo, setLoanDateTo] = useState('');

  const [newLoan, setNewLoan] = useState({ engineerId: '', purpose: 'Mantenimiento', client: '', project: '' });
  const [currentLoanTools, setCurrentLoanTools] = useState<ToolItem[]>([]);
  const [loanSearchTerm, setLoanSearchTerm] = useState('');

  const [newEngineer, setNewEngineer] = useState({ name: '', department: '' });
  const [newTool, setNewTool] = useState<Partial<ToolItem>>({
    name: '', category: 'Eléctricas', serial: '', orimec: '', status: 'available', condition: 'Buena', abcCategory: 'B', quantity: 1, imageUrl: '', files: [], maintenanceHistory: []
  });
  const [newConsumable, setNewConsumable] = useState<Partial<ConsumableItem>>({
    name: '', category: 'General', quantity: 0, minStock: 5, unit: 'unidades'
  });
  const [newMaintenance, setNewMaintenance] = useState({
    description: '', cost: 0, technician: '', isCalibration: false, newLastCal: '', newNextCal: ''
  });
  const [dispatchData, setDispatchData] = useState({ engineerId: '', quantity: 1 });

  const [newFile, setNewFile] = useState({ name: '', url: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedToolImage, setSelectedToolImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [selectedConsumable, setSelectedConsumable] = useState<ConsumableItem | null>(null);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toolImageInputRef = useRef<HTMLInputElement>(null);

  // --- EFECTOS FIREBASE ---
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUserRes) => {
      if (currentUserRes) {
        try {
          const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUserRes.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            let finalRole = data.role as UserRole;
            let finalName = data.name || 'Usuario';
            if (currentUserRes.email === 'alexis.guerra@orimec.com.ec' && finalRole !== 'admin') {
              finalRole = 'admin';
              await updateDoc(userDocRef, { role: 'admin' });
            }
            setCurrentUser(finalName);
            setAppUser({ name: finalName, role: finalRole });
            if (finalRole === 'ingeniero') {
              setActiveTab('inventory');
            } else {
              setActiveTab('dashboard');
            }
          } else {
            // Document doesn't exist, create fallback
            const fallbackRole: UserRole = currentUserRes.email === 'alexis.guerra@orimec.com.ec' ? 'admin' : 'bodeguero';
            const fallbackName = currentUserRes.email?.split('@')[0] || 'Usuario';
            await setDoc(userDocRef, {
              uid: currentUserRes.uid,
              name: fallbackName,
              email: currentUserRes.email || '',
              role: fallbackRole,
              createdAt: new Date().toISOString()
            });
            setCurrentUser(fallbackName);
            setAppUser({ name: fallbackName, role: fallbackRole });
            if (fallbackRole === 'ingeniero') {
              setActiveTab('inventory');
            } else {
              setActiveTab('dashboard');
            }
          }
          setUser(currentUserRes);
        } catch (err) {
          console.error("Error loading user profile:", err);
          // Set user anyway so data loads, fallback name/role
          const fallbackRole: UserRole = currentUserRes.email === 'alexis.guerra@orimec.com.ec' ? 'admin' : 'bodeguero';
          const fallbackName = currentUserRes.email?.split('@')[0] || 'Usuario';
          setCurrentUser(fallbackName);
          setAppUser({ name: fallbackName, role: fallbackRole });
          if (fallbackRole === 'ingeniero') {
            setActiveTab('inventory');
          } else {
            setActiveTab('dashboard');
          }
          setUser(currentUserRes);
        }
      } else {
        setUser(null);
        setCurrentUser('');
        setAppUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubTools = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'tools'), s => {
      setTools(s.docs.map(d => ({ id: d.id, ...d.data() } as ToolItem)));
    });
    const unsubEngineers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'engineers'), s => {
      setEngineers(s.docs.map(d => ({ id: d.id, ...d.data() } as Engineer)));
    });
    const unsubLoans = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'loans'), s => {
      setLoans(s.docs.map(d => ({ id: d.id, ...d.data() } as Loan)));
    });
    const unsubConsumables = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'consumables'), s => {
      setConsumables(s.docs.map(d => ({ id: d.id, ...d.data() } as ConsumableItem)));
    });
    const unsubConsumableLogs = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'consumable_logs'), s => {
      setConsumableLogs(s.docs.map(d => ({ id: d.id, ...d.data() } as ConsumableLog)));
    });
    const unsubLoanRequests = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'loan_requests'), s => {
      setLoanRequests(s.docs.map(d => ({ id: d.id, ...d.data() } as LoanRequest)));
    });
    
    return () => {
      unsubTools();
      unsubEngineers();
      unsubLoans();
      unsubConsumables();
      unsubConsumableLogs();
      unsubLoanRequests();
    };
  }, [user]);

  // Alertas
  useEffect(() => {
    const newAlerts: typeof alerts = [];
    const today = new Date();
    tools.forEach(t => {
      if (t.abcCategory === 'A' && t.nextCalibration && Math.ceil((new Date(t.nextCalibration).getTime() - today.getTime()) / 86400000) <= 30) {
        newAlerts.push({ message: `Calibración próxima: ${t.name}`, type: 'calibration', id: t.id });
      }
    });
    loans.forEach(l => {
      if (!l.dateIn && Math.ceil((today.getTime() - new Date(l.dateOut).getTime()) / 86400000) > 7) {
        const toolNames = l.tools ? l.tools.map(t => t.name).join(', ') : (l.toolId ? getToolName(l.toolId) : 'Varias');
        newAlerts.push({ message: `Préstamo vencido: ${toolNames}`, type: 'loan', loanId: l.id });
      }
    });
    consumables.forEach(c => {
      if (c.quantity <= c.minStock) {
        newAlerts.push({ message: `Stock crítico: ${c.name}`, type: 'stock', consumableId: c.id });
      }
    });
    setAlerts(newAlerts);
  }, [tools, loans, consumables]);

  // Accesos rápidos de teclado
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!shortcutsEnabled.current) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      
      if (e.key === 'Escape') {
        setShowLoanModal(false);
        setShowToolModal(false);
        setShowDetailsModal(false);
        setAlertModal(null);
        setReturnModal(null);
        setLoanConfirmStep(false);
        setShowEngineerDetailsModal(false);
        setShowEngineerModal(false);
        setShowImportModal(false);
        setShowConsumableModal(false);
        setShowDispatchModal(false);
      }
      if (e.key === 'n' || e.key === 'N') {
        setShowLoanModal(true);
      }
      if (e.key === 'b' || e.key === 'B') {
        setShowGlobalSearch(s => !s);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Zoom con Ctrl + Scroll
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setAppZoom(prevZoom => {
          const newZoom = e.deltaY > 0 ? prevZoom - 0.05 : prevZoom + 0.05;
          return Math.min(Math.max(0.6, newZoom), 1.5);
        });
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;
    setAuthError('');
    setAuthSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      addToast('¡Sesión iniciada con éxito!', 'success');
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Error al iniciar sesión. Verifique sus credenciales.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMsg = 'Correo o contraseña incorrectos.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMsg = 'Demasiados intentos fallidos. Intente más tarde.';
      }
      setAuthError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleEmailSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim() || !signupPassword || !signupName.trim()) {
      setAuthError('Por favor complete todos los campos.');
      return;
    }
    if (signupPassword.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, signupEmail.trim(), signupPassword);
      // Guardar el perfil en la colección users
      const userDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', res.user.uid);
      const finalRole = signupEmail.trim() === 'alexis.guerra@orimec.com.ec' ? 'admin' : signupRole;
      await setDoc(userDocRef, {
        uid: res.user.uid,
        name: signupName.trim(),
        email: signupEmail.trim(),
        role: finalRole,
        createdAt: new Date().toISOString()
      });
      if (finalRole === 'ingeniero') {
        const normalizeName = (name: string) => {
          return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        };

        const normalizedSignupName = normalizeName(signupName);
        const matchedEngineer = engineers.find(eng => normalizeName(eng.name) === normalizedSignupName);

        if (matchedEngineer) {
          // 1. Crear el nuevo documento de ingeniero con la UID como ID
          const newEngineerDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'engineers', res.user.uid);
          await setDoc(newEngineerDocRef, {
            id: res.user.uid,
            name: signupName.trim(),
            department: matchedEngineer.department || 'Ingeniería'
          });

          // 2. Eliminar el documento de ingeniero antiguo con ID aleatorio
          const oldEngineerDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'engineers', matchedEngineer.id);
          await deleteDoc(oldEngineerDocRef);

          // 3. Modificar todas las referencias de préstamos anteriores para que apunten a la UID
          const batch = writeBatch(db);
          
          const matchedLoans = loans.filter(l => l.engineerId === matchedEngineer!.id);
          matchedLoans.forEach(l => {
            const loanDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'loans', l.id);
            batch.update(loanDocRef, { engineerId: res.user.uid });
          });

          // 4. Modificar todas las referencias de consumibles anteriores
          const matchedConsumables = consumableLogs.filter(cl => cl.engineerId === matchedEngineer!.id);
          matchedConsumables.forEach(cl => {
            const clDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'consumable_logs', cl.id);
            batch.update(clDocRef, { engineerId: res.user.uid });
          });

          // 5. Modificar todas las referencias de solicitudes anteriores
          const matchedRequests = loanRequests.filter(r => r.engineerUid === matchedEngineer!.id);
          matchedRequests.forEach(r => {
            const reqDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'loan_requests', r.id);
            batch.update(reqDocRef, { engineerUid: res.user.uid });
          });

          await batch.commit();
        } else {
          // Si no existe coincidencia, creamos el perfil desde cero
          const engineerDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'engineers', res.user.uid);
          await setDoc(engineerDocRef, {
            id: res.user.uid,
            name: signupName.trim(),
            department: 'Ingeniería'
          });
        }
      }
      addToast('¡Cuenta creada y sesión iniciada!', 'success');
    } catch (err: any) {
      console.error(err);
      let errorMsg = 'Error al registrar la cuenta.';
      if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'El correo electrónico ya está registrado.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'La contraseña es muy débil (mínimo 6 caracteres).';
      }
      setAuthError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSaveTool = async () => {
    if (!user) return;
    try {
      let finalImageUrl = newTool.imageUrl;
      if (selectedToolImage) finalImageUrl = await fileToBase64(selectedToolImage);
      const toolData = { 
        ...newTool, 
        imageUrl: finalImageUrl || '', 
        quantity: newTool.quantity || 1, 
        maintenanceHistory: newTool.maintenanceHistory || [] 
      };

      if (isEditingTool && newTool.id) {
        const original = tools.find(t => t.id === newTool.id);
        if (original) {
          const changes: EditLogEntry[] = [];
          const fields: (keyof ToolItem)[] = ['name', 'serial', 'status', 'condition', 'category', 'abcCategory', 'nextCalibration'];
          fields.forEach(f => {
            if (String(original[f] || '') !== String((newTool as any)[f] || '')) {
              changes.push({
                field: f,
                oldValue: String(original[f] || ''),
                newValue: String((newTool as any)[f] || ''),
                changedBy: currentUser,
                changedAt: new Date().toISOString()
              });
            }
          });
          if (changes.length > 0) {
            setEditHistory(prev => ({ ...prev, [newTool.id!]: [...(prev[newTool.id!] || []), ...changes] }));
          }
        }
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tools', newTool.id), toolData);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tools'), toolData);
      }
      setShowToolModal(false);
      setSelectedToolImage(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddFileToTool = async () => {
    if (!selectedTool || !user) return;
    try {
      let finalUrl = newFile.url;
      let fileType = 'link';
      if (selectedFile) {
        finalUrl = await fileToBase64(selectedFile);
        fileType = 'file';
      } else if (!finalUrl.startsWith('http')) {
        finalUrl = 'https://' + finalUrl;
      }
      const updatedFiles = [...(selectedTool.files || []), { name: newFile.name, url: finalUrl, type: fileType }];
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tools', selectedTool.id), { files: updatedFiles });
      setSelectedTool({ ...selectedTool, files: updatedFiles });
      setNewFile({ name: '', url: '' });
      setSelectedFile(null);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const isAdmin = appUser?.role === 'admin';

  const handleDeleteTool = async (id: string) => {
    if (!isAdmin) return alert('Solo los administradores pueden eliminar activos.');
    if (window.confirm('¿Confirmas la eliminación permanente de este activo?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tools', id));
      addActivity('Activo eliminado', id);
    }
  };

  const handleSaveConsumable = async () => {
    if (user && newConsumable.name) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'consumables'), newConsumable);
      setShowConsumableModal(false);
      setNewConsumable({ name: '', quantity: 0, minStock: 5 });
    }
  };

  const handleDeleteConsumable = async (id: string) => {
    if (!isAdmin) return alert('Solo los administradores pueden eliminar consumibles.');
    if (window.confirm('¿Confirmas la eliminación?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'consumables', id));
      addActivity('Consumible eliminado', id);
    }
  };

  const openDispatchModal = (item: ConsumableItem) => {
    setSelectedConsumable(item);
    setDispatchData({ engineerId: '', quantity: 1 });
    setShowDispatchModal(true);
  };

  const handleDispatchConsumable = async () => {
    if (!user || !selectedConsumable || !dispatchData.engineerId) return alert("Selecciona personal y cantidad");
    if (selectedConsumable.quantity < dispatchData.quantity) return alert("Stock insuficiente.");
    
    try {
      const batch = writeBatch(db);
      const itemRef = doc(db, 'artifacts', appId, 'public', 'data', 'consumables', selectedConsumable.id);
      batch.update(itemRef, { quantity: selectedConsumable.quantity - dispatchData.quantity });

      const logRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'consumable_logs'));
      batch.set(logRef, {
        consumableId: selectedConsumable.id,
        consumableName: selectedConsumable.name,
        engineerId: dispatchData.engineerId,
        engineerName: getEngineerName(dispatchData.engineerId),
        quantity: dispatchData.quantity,
        date: new Date().toISOString()
      });

      await batch.commit();
      setShowDispatchModal(false);
    } catch (e) {
      alert("Error al despachar: " + e);
    }
  };

  const handleAddMaintenance = async () => {
    if (!selectedTool) return;
    if (!newMaintenance.isCalibration && !newMaintenance.description) return;
    const today = new Date().toISOString().split('T')[0];
    const desc = newMaintenance.description || (newMaintenance.isCalibration ? 'Calibración periódica' : '');
    const r = { 
      id: Date.now().toString(), 
      date: today, 
      description: desc, 
      cost: newMaintenance.cost, 
      technician: newMaintenance.technician 
    };
    const h = [r, ...(selectedTool.maintenanceHistory || [])];
    const calUpdate: any = { maintenanceHistory: h, status: 'available' };
    if (newMaintenance.isCalibration) {
      calUpdate.lastCalibration = newMaintenance.newLastCal || today;
      if (newMaintenance.newNextCal) calUpdate.nextCalibration = newMaintenance.newNextCal;
    } else {
      calUpdate.status = 'maintenance';
    }
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tools', selectedTool.id), calUpdate);
    setSelectedTool({ ...selectedTool, ...calUpdate, maintenanceHistory: h });
    setNewMaintenance({ description: '', cost: 0, technician: '', isCalibration: false, newLastCal: '', newNextCal: '' });
    addToast(newMaintenance.isCalibration ? 'Calibración registrada — alerta eliminada' : 'Intervención registrada');
  };

  const toggleToolSelectionForLoan = (tool: ToolItem) => {
    if (currentLoanTools.find(t => t.id === tool.id)) {
      setCurrentLoanTools(currentLoanTools.filter(t => t.id !== tool.id));
    } else {
      setCurrentLoanTools([...currentLoanTools, tool]);
    }
  };

  const handleCreateLoan = async () => {
    if (!user || currentLoanTools.length === 0 || !newLoan.engineerId) return alert("Completa la información requerida.");
    const loanData = { 
      ...newLoan, 
      tools: currentLoanTools.map(t => ({ id: t.id, name: t.name, serial: t.serial })), 
      dateOut: new Date().toISOString(), 
      dateIn: null, 
      client: newLoan.client || 'Interno', 
      project: newLoan.project || 'General' 
    };
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'loans'), loanData);
      const batch = writeBatch(db);
      currentLoanTools.forEach(tool => {
        batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'tools', tool.id), { status: 'in-use' });
      });
      await batch.commit();
      setShowLoanModal(false);
      setNewLoan({ engineerId: '', purpose: 'Mantenimiento', client: '', project: '' });
      setCurrentLoanTools([]);
      setLoanSearchTerm('');
      setActivityLog(prev => [
        { 
          icon: '↗', 
          text: `Salida: ${currentLoanTools.length} activo${currentLoanTools.length !== 1 ? 's' : ''} → ${getEngineerName(newLoan.engineerId)}`, 
          time: new Date(), 
          user: currentUser 
        }, 
        ...prev
      ].slice(0, 30));
    } catch (error) {
      alert("Error: " + error);
    }
  };

  const handleCreateLoanRequest = async (data: {
    targetDate: string;
    durationDays: number;
    destination: string;
    purpose: string;
    project?: string;
    client?: string;
  }) => {
    if (!user || !appUser) return;
    try {
      const reqData: Omit<LoanRequest, 'id'> = {
        engineerUid: user.uid,
        engineerName: appUser.name,
        tools: selectedRequestTools.map(t => ({ id: t.id, name: t.name, serial: t.serial })),
        requestDate: new Date().toISOString(),
        targetDate: data.targetDate,
        durationDays: data.durationDays,
        destination: data.destination,
        purpose: data.purpose,
        project: data.project,
        client: data.client,
        status: 'pending'
      };
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'loan_requests'), reqData);
      setSelectedRequestTools([]);
      setShowSolicitudModal(false);
      addToast('Solicitud de préstamo enviada correctamente.', 'success');
    } catch (e: any) {
      console.error("Error creating loan request:", e);
      addToast('Error al enviar la solicitud: ' + e.message, 'error');
    }
  };

  const handleApproveRequest = async (req: LoanRequest) => {
    if (!user || !appUser) return;
    try {
      // 1. Create a loan document
      const loanData = {
        tools: req.tools,
        engineerId: req.engineerUid,
        dateOut: new Date().toISOString(),
        dateIn: null,
        purpose: req.purpose,
        project: req.project || 'General',
        client: req.client || 'Interno'
      };

      const loanDocRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'loans'));
      const requestDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'loan_requests', req.id);

      const batch = writeBatch(db);
      
      // Set the loan document
      batch.set(loanDocRef, loanData);

      // Update tools status to 'in-use'
      req.tools.forEach(tool => {
        batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'tools', tool.id), { status: 'in-use' });
      });

      // Update the request status
      batch.update(requestDocRef, {
        status: 'approved',
        resolvedBy: appUser.name,
        resolvedAt: new Date().toISOString()
      });

      await batch.commit();

      addToast('Solicitud aprobada y préstamo registrado.', 'success');

      setActivityLog(prev => [
        { 
          icon: '✅', 
          text: `Aprobado: ${req.tools.length} activo${req.tools.length !== 1 ? 's' : ''} → ${req.engineerName}`, 
          time: new Date(), 
          user: currentUser 
        }, 
        ...prev
      ].slice(0, 30));
    } catch (error: any) {
      console.error(error);
      addToast('Error al aprobar la solicitud: ' + error.message, 'error');
    }
  };

  const handleRejectRequest = async (req: LoanRequest, reason: string) => {
    if (!user || !appUser) return;
    try {
      const requestDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'loan_requests', req.id);
      await updateDoc(requestDocRef, {
        status: 'rejected',
        rejectionReason: reason,
        resolvedBy: appUser.name,
        resolvedAt: new Date().toISOString()
      });

      addToast('Solicitud rechazada.', 'info');

      setActivityLog(prev => [
        { 
          icon: '❌', 
          text: `Rechazado: Préstamo de ${req.tools.length} activo${req.tools.length !== 1 ? 's' : ''} → ${req.engineerName}`, 
          time: new Date(), 
          user: currentUser 
        }, 
        ...prev
      ].slice(0, 30));
    } catch (error: any) {
      console.error(error);
      addToast('Error al rechazar la solicitud: ' + error.message, 'error');
    }
  };

  const handleOpenReturnModal = (loan: Loan) => {
    setReturnLoan(loan);
    setReturnCondition('Bueno');
    setReturnNotes('');
    setSelectedReturnTools(loan.tools?.map(t => t.id) || (loan.toolId ? [loan.toolId] : []));
    setShowReturnModal(true);
  };

  const confirmReturn = async () => {
    if (!returnLoan) return;
    const loan = returnLoan;
    const statusMap: Record<string, string> = { 'Bueno': 'available', 'Con daños': 'broken', 'Requiere revisión': 'maintenance' };
    const allIds = loan.tools?.map(t => t.id) || (loan.toolId ? [loan.toolId] : []);
    const remaining = allIds.filter(id => !selectedReturnTools.includes(id));
    const returnedTools = loan.tools?.filter(t => selectedReturnTools.includes(t.id)) || [];
    
    try {
      const batch = writeBatch(db);
      if (remaining.length === 0) {
        batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'loans', loan.id), {
          dateIn: new Date().toISOString(),
          returnCondition,
          returnNotes,
          returnReceivedBy: currentUser
        });
      } else {
        const remainingTools = loan.tools?.filter(t => remaining.includes(t.id)) || [];
        batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'loans', loan.id), {
          tools: remainingTools,
          partialReturns: [...(loan.partialReturns || []), {
            tools: returnedTools,
            date: new Date().toISOString(),
            returnCondition,
            returnNotes,
            returnReceivedBy: currentUser
          }]
        });
      }
      selectedReturnTools.forEach(id => {
        batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'tools', id), { status: statusMap[returnCondition] || 'available' });
      });
      await batch.commit();
      const names = returnedTools.map(t => t.name).join(', ') || 'Activos';
      setActivityLog(prev => [
        { 
          icon: '✓', 
          text: `Devolución${remaining.length > 0 ? ' parcial' : ''}: ${names} — ${returnCondition}`, 
          time: new Date(), 
          user: currentUser 
        }, 
        ...prev
      ].slice(0, 30));
      setShowReturnModal(false);
      setReturnLoan(null);
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const handleCreateEngineer = async () => {
    if (!newEngineer.name.trim()) return;
    const normalizeName = (name: string) => {
      return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };
    const norm = normalizeName(newEngineer.name);
    const exists = engineers.some(eng => normalizeName(eng.name) === norm);
    if (exists) {
      alert("Ya existe un perfil técnico con este nombre.");
      return;
    }
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'engineers'), newEngineer);
    setShowEngineerModal(false);
    setNewEngineer({ name: '', department: '' });
    addToast('Perfil técnico creado correctamente.', 'success');
  };

  const handleDeleteEngineer = async (id: string) => {
    if (selectedEngineer?.id === id) {
      setShowEngineerDetailsModal(false);
      setSelectedEngineer(null);
    }
    if (window.confirm('¿Confirmas la eliminación?')) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'engineers', id));
    }
  };

  const getToolName = (id: string) => tools.find(t => t.id === id)?.name || 'Desconocido';
  const getEngineerName = (id: string) => engineers.find(e => e.id === id)?.name || 'Desconocido';

  const handleOpenDetails = (t: ToolItem) => {
    setSelectedTool(t);
    setModalTab('general');
    setShowDetailsModal(true);
  };

  const handleOpenEngineerDetails = (eng: Engineer) => {
    setSelectedEngineer(eng);
    setEngineerModalTab('loans');
    setShowEngineerDetailsModal(true);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      if (!newFile.name) setNewFile({ ...newFile, name: e.target.files[0].name });
    }
  };

  const handleToolImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedToolImage(e.target.files[0]);
  };

  const openCreateToolModal = () => {
    setIsEditingTool(false);
    setNewTool({ 
      name: '', category: 'Eléctricas', serial: '', orimec: '', status: 'available', 
      condition: 'Buena', abcCategory: 'B', quantity: 1, lastCalibration: '', 
      nextCalibration: '', imageUrl: '', files: [], maintenanceHistory: [] 
    });
    setSelectedToolImage(null);
    if (toolImageInputRef.current) toolImageInputRef.current.value = '';
    setShowToolModal(true);
  };

  const openEditToolModal = (t: ToolItem) => {
    setIsEditingTool(true);
    setNewTool(t);
    setSelectedToolImage(null);
    setShowToolModal(true);
  };

  const exportInventory = () => {
    exportToCSV(tools.map(t => ({ 
      Nombre: t.name, Serie: t.serial, Estado: t.status, 
      Categoria: t.category, Cantidad: t.quantity 
    })), 'Inventario');
  };

  const exportLoans = () => {
    exportToCSV(loans.map(l => ({ 
      Herramientas: l.tools ? l.tools.map(t => t.name).join(', ') : getToolName(l.toolId || ''), 
      Ingeniero: getEngineerName(l.engineerId), 
      Salida: new Date(l.dateOut).toLocaleString(), 
      Retorno: l.dateIn ? new Date(l.dateIn).toLocaleString() : 'Pendiente', 
      Proyecto: l.project, Motivo: l.purpose 
    })), 'Prestamos');
  };

  const getEngineerLoans = (engineerId: string) => {
    return loans.filter(l => l.engineerId === engineerId)
      .sort((a, b) => new Date(b.dateOut).getTime() - new Date(a.dateOut).getTime());
  };

  const getEngineerConsumables = (engineerId: string) => {
    return consumableLogs.filter(l => l.engineerId === engineerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const addActivity = (text: string, refId: string) => {
    setActivityLog(prev => [{ icon: '➔', text: `${text}: ${refId}`, time: new Date(), user: currentUser }, ...prev].slice(0, 30));
  };

  // --- RENDERIZADO CARGANDO SESION ---
  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 font-sans transition-colors dark:bg-[#0f1117]">
        <div className="flex flex-col items-center">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-blue-600/30 animate-pulse">
            <Wrench size={32} className="animate-spin duration-1000" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">Cargando ToolTrack...</h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Verificando sesión activa...</p>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO ACCESO AL SISTEMA ---
  if (!currentUser) {
    return (
      <div className="h-screen w-full flex items-center justify-center relative bg-slate-50 font-sans overflow-hidden">
        <div 
          className="fixed inset-0 z-0 pointer-events-none" 
          style={{ backgroundImage: "url('Logo-Orimec.png')", backgroundSize: 'cover', opacity: 0.03, filter: 'blur(8px)' }} 
        />
        
        {/* Decorative subtle ambient lights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[6s]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[8s]" />

        <div className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-200/60 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-500 fade-in">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/30">
              <Wrench size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TOOLTRACK</h1>
            <p className="text-slate-500 text-sm mt-0.5 font-medium">Enterprise Asset Management</p>
          </div>

          {/* Toggle Tab Login / Register */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setAuthError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                !isRegistering ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setAuthError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                isRegistering ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Registrar Cuenta
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium animate-in fade-in duration-300">
              {authError}
            </div>
          )}

          {!isRegistering ? (
            /* FORMULARIO LOGIN */
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all outline-none bg-slate-50/50 text-sm font-medium" 
                    placeholder="correo@orimec.com.ec" 
                    value={loginEmail} 
                    onChange={e => setLoginEmail(e.target.value)} 
                    disabled={authSubmitting}
                    autoFocus 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all outline-none bg-slate-50/50 text-sm font-medium" 
                    placeholder="••••••••" 
                    value={loginPassword} 
                    onChange={e => setLoginPassword(e.target.value)}
                    disabled={authSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={authSubmitting || !loginEmail.trim() || !loginPassword} 
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-50 disabled:shadow-none mt-4 flex justify-center items-center gap-2"
              >
                {authSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Ingresar al Sistema'}
              </button>
            </form>
          ) : (
            /* FORMULARIO REGISTRO */
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Nombre Completo</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <UserIcon size={16} />
                  </span>
                  <input 
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all outline-none bg-slate-50/50 text-sm font-medium" 
                    placeholder="Ej. Alexis Guerra" 
                    value={signupName} 
                    onChange={e => setSignupName(e.target.value)}
                    disabled={authSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Correo Electrónico</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={16} />
                  </span>
                  <input 
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all outline-none bg-slate-50/50 text-sm font-medium" 
                    placeholder="correo@orimec.com.ec" 
                    value={signupEmail} 
                    onChange={e => setSignupEmail(e.target.value)}
                    disabled={authSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={16} />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-500 transition-all outline-none bg-slate-50/50 text-sm font-medium" 
                    placeholder="Mínimo 6 caracteres" 
                    value={signupPassword} 
                    onChange={e => setSignupPassword(e.target.value)}
                    disabled={authSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {signupEmail.trim() !== 'alexis.guerra@orimec.com.ec' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Rol Solicitado</label>
                  <div className="grid grid-cols-3 gap-3">
                    {([['admin', 'Administrador', 'Acceso total'], ['bodeguero', 'Bodeguero', 'Préstamos'], ['ingeniero', 'Ingeniero', 'Solicitudes']] as const).map(([role, label, desc]) => (
                      <button 
                        key={role} 
                        type="button" 
                        onClick={() => setSignupRole(role)}
                        disabled={authSubmitting}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          signupRole === role ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/10' : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <p className={`text-xs font-bold ${signupRole === role ? 'text-blue-700' : 'text-slate-700'}`}>{label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {signupEmail.trim() === 'alexis.guerra@orimec.com.ec' && (
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-medium animate-in fade-in duration-300">
                  Este correo tiene asignado el rol de <strong>Administrador</strong> por defecto.
                </div>
              )}

              <button 
                type="submit" 
                disabled={authSubmitting || !signupEmail.trim() || !signupPassword || !signupName.trim()} 
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 transition-all disabled:opacity-50 disabled:shadow-none mt-4 flex justify-center items-center gap-2"
              >
                {authSubmitting ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Crear Cuenta'}
              </button>
            </form>
          )}
          <p className="text-center text-[10px] text-slate-300 mt-5">N: nuevo préstamo · B: búsqueda · Esc: cerrar</p>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO APLICACIÓN PRINCIPAL ---
  return (
    <div 
      className="dm-bg font-sans flex flex-col md:flex-row relative selection:bg-blue-100 selection:text-blue-900 overflow-hidden transition-colors"
      style={{ 
        zoom: appZoom,
        width: `${100 / appZoom}vw`,
        height: `${100 / appZoom}vh`
      } as React.CSSProperties}
    >
      <style>{`
        @media print { 
          body * { visibility: hidden; } 
          #printable-qr, #printable-qr * { visibility: visible; } 
          #printable-qr { 
            position: absolute; left: 0; top: 0; width: 100%; height: 100%; 
            display: flex; flex-direction: column; align-items: center; 
            justify-content: center; background: white; padding: 20px; 
            border:none; box-shadow:none;
          } 
          .no-print { display: none !important; } 
        }
        :root { --dm-bg: #f8fafc; --dm-surface: #ffffff; --dm-surface2: #f8fafc; --dm-border: #e2e8f0; --dm-text: #0f172a; --dm-text2: #475569; --dm-text3: #94a3b8; --dm-sidebar: #0B1528; }
        [data-theme="dark"] { --dm-bg: #0b0f19; --dm-surface: #161f30; --dm-surface2: #0f172a; --dm-border: #24334f; --dm-text: #f8fafc; --dm-text2: #cbd5e1; --dm-text3: #94a3b8; --dm-sidebar: #090d18; }
        .dm-bg { background: var(--dm-bg) !important; }
        .dm-surface { background: var(--dm-surface) !important; border-color: var(--dm-border) !important; }
        .dm-surface2 { background: var(--dm-surface2) !important; }
        .dm-text { color: var(--dm-text) !important; }
        .dm-text2 { color: var(--dm-text2) !important; }
        .dm-text3 { color: var(--dm-text3) !important; }
        .dm-border { border-color: var(--dm-border) !important; }
        .dm-divide > * + * { border-color: var(--dm-border) !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Barra de Navegación Lateral */}
      <BarraLateral 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alertsCount={alerts.length}
        pendingRequestsCount={loanRequests.filter(r => r.status === 'pending').length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentUser={currentUser}
        userRole={appUser?.role || 'bodeguero'}
        logout={async () => {
          try {
            await signOut(auth);
            addToast('Sesión cerrada correctamente.', 'info');
          } catch (e: any) {
            console.error("Error signing out:", e);
            addToast('Error al cerrar sesión.', 'error');
          }
        }}
      />

      <main className="flex-1 flex flex-col h-full p-6 md:p-8 relative overflow-hidden dm-bg">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
          
          {/* Pestaña: Panel Operativo */}
          {activeTab === 'dashboard' && (
            <TabPanelControl 
              tools={tools}
              loans={loans}
              engineers={engineers}
              alerts={alerts}
              setAlertModal={setAlertModal}
              showGlobalSearch={showGlobalSearch}
              setShowGlobalSearch={setShowGlobalSearch}
              globalSearch={globalSearch}
              setGlobalSearch={setGlobalSearch}
              getEngineerName={getEngineerName}
              getToolName={getToolName}
              setSelectedTool={setSelectedTool}
              setModalTab={setModalTab}
              setShowDetailsModal={setShowDetailsModal}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Pestaña: Activos Fijos */}
          {activeTab === 'inventory' && (
            <TabInventario 
              tools={tools}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterABC={filterABC}
              setFilterABC={setFilterABC}
              inventoryPage={inventoryPage}
              setInventoryPage={setInventoryPage}
              ITEMS_PER_PAGE={ITEMS_PER_PAGE}
              setShowImportModal={setShowImportModal}
              exportInventory={exportInventory}
              generateInventoryPDF={generateInventoryPDF}
              openCreateToolModal={openCreateToolModal}
              handleOpenDetails={handleOpenDetails}
              setSelectedTool={setSelectedTool}
              setShowQRModal={setShowQRModal}
              openEditToolModal={openEditToolModal}
              handleDeleteTool={handleDeleteTool}
              userRole={appUser?.role || 'bodeguero'}
              selectedRequestTools={selectedRequestTools}
              setSelectedRequestTools={setSelectedRequestTools}
              openSolicitudModal={() => setShowSolicitudModal(true)}
            />
          )}

          {/* Pestaña: Préstamos */}
          {activeTab === 'loans' && (
            <TabPrestamos 
              loans={loans}
              engineers={engineers}
              tools={tools}
              loanFilter={loanFilter}
              setLoanFilter={setLoanFilter}
              loanSearch={loanSearch}
              setLoanSearch={setLoanSearch}
              loanDateFrom={loanDateFrom}
              setLoanDateFrom={setLoanDateFrom}
              loanDateTo={loanDateTo}
              setLoanDateTo={setLoanDateTo}
              getEngineerName={getEngineerName}
              getToolName={getToolName}
              handleOpenReturnModal={handleOpenReturnModal}
              generateLoanPDF={generateLoanPDF}
              exportLoans={exportLoans}
              setShowLoanModal={setShowLoanModal}
            />
          )}

          {/* Pestaña: Solicitudes (Admin/Storekeeper) */}
          {activeTab === 'requests' && (
            <TabSolicitudes 
              loanRequests={loanRequests}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
            />
          )}

          {/* Pestaña: Mis Solicitudes (Engineer) */}
          {activeTab === 'my_requests' && user && (
            <TabMisSolicitudes 
              loanRequests={loanRequests}
              currentUserUid={user.uid}
            />
          )}

          {/* Pestaña: Consumibles */}
          {activeTab === 'consumables' && (
            <TabConsumibles 
              consumables={consumables}
              consumableLogs={consumableLogs}
              isAdmin={isAdmin}
              handleDeleteConsumable={handleDeleteConsumable}
              openDispatchModal={openDispatchModal}
              setShowConsumableModal={setShowConsumableModal}
            />
          )}

          {/* Pestaña: Personal Técnico */}
          {activeTab === 'engineers' && (
            <TabPersonal 
              engineers={engineers}
              setShowEngineerModal={setShowEngineerModal}
              handleOpenEngineerDetails={handleOpenEngineerDetails}
              handleDeleteEngineer={handleDeleteEngineer}
            />
          )}

          {/* Pestaña: Calibraciones */}
          {activeTab === 'calendar' && (
            <TabCalibraciones 
              tools={tools}
              calendarMonth={calendarMonth}
              setCalendarMonth={setCalendarMonth}
              setSelectedTool={setSelectedTool}
              setModalTab={setModalTab}
              setShowDetailsModal={setShowDetailsModal}
              setNewMaintenance={setNewMaintenance}
            />
          )}

          {/* Pestaña: Reportes */}
          {activeTab === 'reports' && (
            <TabReportes 
              tools={tools}
              loans={loans}
              engineers={engineers}
              alerts={alerts}
              generateReportPDF={generateReportPDF}
            />
          )}

          {/* TOASTS NOTIFICACIONES */}
          <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
              <div 
                key={t.id} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-bold pointer-events-auto animate-in slide-in-from-bottom-2 duration-300 ${
                  t.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : t.type === 'error' 
                      ? 'bg-red-50 text-red-800 border-red-200' 
                      : 'bg-blue-50 text-blue-800 border-blue-200'
                }`}
              >
                {t.msg}
              </div>
            ))}
          </div>

          {/* MODALES EMERGENTES */}
          
          {showDetailsModal && selectedTool && (
            <ModalDetalleActivo 
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              setShowDetailsModal={setShowDetailsModal}
              modalTab={modalTab}
              setModalTab={setModalTab}
              appZoom={appZoom}
              loans={loans}
              engineers={engineers}
              getEngineerName={getEngineerName}
              isAdmin={isAdmin}
              newFile={newFile}
              setNewFile={setNewFile}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              fileInputRef={fileInputRef}
              handleAddFileToTool={handleAddFileToTool}
              handleFileSelect={handleFileSelect}
              newMaintenance={newMaintenance}
              setNewMaintenance={setNewMaintenance}
              handleAddMaintenance={handleAddMaintenance}
              newComponent={newComponent}
              setNewComponent={setNewComponent}
              addToast={addToast}
            />
          )}

          {showQRModal && selectedTool && (
            <ModalImpresionQR 
              selectedTool={selectedTool}
              setShowQRModal={setShowQRModal}
              generateQRUrl={generateQRUrl}
            />
          )}

          {alertModal && (
            <ModalAlertaActiva 
              alertModal={alertModal}
              setAlertModal={setAlertModal}
              tools={tools}
              loans={loans}
              consumables={consumables}
              getEngineerName={getEngineerName}
              getToolName={getToolName}
              setActiveTab={setActiveTab}
              setSelectedTool={setSelectedTool}
              setModalTab={setModalTab}
              setShowDetailsModal={setShowDetailsModal}
              setNewMaintenance={setNewMaintenance}
            />
          )}

          {showReturnModal && returnLoan && (
            <ModalDevolucion 
              returnLoan={returnLoan}
              setShowReturnModal={setShowReturnModal}
              selectedReturnTools={selectedReturnTools}
              setSelectedReturnTools={setSelectedReturnTools}
              returnCondition={returnCondition}
              setReturnCondition={setReturnCondition}
              returnNotes={returnNotes}
              setReturnNotes={setReturnNotes}
              currentUser={currentUser}
              confirmReturn={confirmReturn}
            />
          )}

          {loanConfirmStep && (
            <ModalConfirmarPrestamo 
              newLoan={newLoan}
              currentLoanTools={currentLoanTools}
              setLoanConfirmStep={setLoanConfirmStep}
              getEngineerName={getEngineerName}
              handleCreateLoan={handleCreateLoan}
            />
          )}

          {showToolModal && (
            <ModalFormularioActivo 
              isEditingTool={isEditingTool}
              newTool={newTool}
              setNewTool={setNewTool}
              setShowToolModal={setShowToolModal}
              handleSaveTool={handleSaveTool}
              toolImageInputRef={toolImageInputRef}
              handleToolImageSelect={handleToolImageSelect}
              selectedToolImage={selectedToolImage}
              setSelectedToolImage={setSelectedToolImage}
              appZoom={appZoom}
            />
          )}

          {showLoanModal && (
            <ModalEmisionPrestamo 
              setShowLoanModal={setShowLoanModal}
              newLoan={newLoan}
              setNewLoan={setNewLoan}
              tools={tools}
              engineers={engineers}
              currentLoanTools={currentLoanTools}
              toggleToolSelectionForLoan={toggleToolSelectionForLoan}
              loanSearchTerm={loanSearchTerm}
              setLoanSearchTerm={setLoanSearchTerm}
              setLoanConfirmStep={setLoanConfirmStep}
              appZoom={appZoom}
              engineerSelectorOpen={engineerSelectorOpen}
              setEngineerSelectorOpen={setEngineerSelectorOpen}
              engineerSelectorSearch={engineerSelectorSearch}
              setEngineerSelectorSearch={setEngineerSelectorSearch}
            />
          )}

          {showConsumableModal && (
            <ModalFormularioConsumible 
              setShowConsumableModal={setShowConsumableModal}
              newConsumable={newConsumable}
              setNewConsumable={setNewConsumable}
              handleSaveConsumable={handleSaveConsumable}
              appZoom={appZoom}
            />
          )}

          {showDispatchModal && selectedConsumable && (
            <ModalDespachoConsumible 
              setShowDispatchModal={setShowDispatchModal}
              selectedConsumable={selectedConsumable}
              dispatchData={dispatchData}
              setDispatchData={setDispatchData}
              engineers={engineers}
              handleDispatchConsumable={handleDispatchConsumable}
              appZoom={appZoom}
            />
          )}

          {showEngineerDetailsModal && selectedEngineer && (
            <ModalDetalleIngeniero 
              selectedEngineer={selectedEngineer}
              setShowEngineerDetailsModal={setShowEngineerDetailsModal}
              engineerModalTab={engineerModalTab}
              setEngineerModalTab={setEngineerModalTab}
              getEngineerLoans={getEngineerLoans}
              getEngineerConsumables={getEngineerConsumables}
              appZoom={appZoom}
            />
          )}

          {showEngineerModal && (
            <ModalFormularioIngeniero 
              setShowEngineerModal={setShowEngineerModal}
              newEngineer={newEngineer}
              setNewEngineer={setNewEngineer}
              handleCreateEngineer={handleCreateEngineer}
              appZoom={appZoom}
            />
          )}

          {showSolicitudModal && selectedRequestTools.length > 0 && (
            <ModalFormularioSolicitud 
              selectedTools={selectedRequestTools}
              setShowSolicitudModal={setShowSolicitudModal}
              onSubmitSolicitud={handleCreateLoanRequest}
              appZoom={appZoom}
            />
          )}

          {showImportModal && (
            <ModalImportarCSV 
              setShowImportModal={setShowImportModal}
              importPreview={importPreview}
              setImportPreview={setImportPreview}
              importErrors={importErrors}
              setImportErrors={setImportErrors}
              importFileRef={importFileRef}
              tools={tools}
              addToast={addToast}
            />
          )}

        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BodegaContent />
    </ErrorBoundary>
  );
}