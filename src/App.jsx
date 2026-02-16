import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Shield, LayoutDashboard, PlusCircle, Database, LogOut, Lock, Sun, Moon,
  Trash2, Send, Users, Vault, Layers2, UserRoundPlus, UserRoundMinus, UserRoundPen, CircleMinus
} from 'lucide-react';

// ============================================================================
// DEBUG MODE CONFIGURATION
// ============================================================================
// Set this to true to enable debug mode (skip login, use test data)
// In production, this should be false
const debugModeEnv = import.meta.env.VITE_DEBUG_MODE;
const DEBUG_MODE = typeof debugModeEnv === 'string'
  ? ['true', '1', 'yes', 'on'].includes(debugModeEnv.trim().toLowerCase())
  : Boolean(debugModeEnv);

// ============================================================================
// BRANDING & CUSTOMIZATION CONFIGURATION
// ============================================================================
// 
// This configuration object allows site administrators to customize the application's
// branding without modifying code. All changes take effect immediately on app restart.
//
// CUSTOMIZATION GUIDE:
// 1. siteName: Display name shown next to the logo at the top of the page
// 2. logoIcon: Choose from predefined icons (Shield, Lock, Database, Vault)
// 3. logoImageUrl: OPTIONAL - Path to custom logo image file
//    Recommended Format:
//    - File Type: PNG or SVG (transparent background preferred)
//    - Resolution: 40x40 pixels (displayed at h-10 w-10)
//    - Optimal Size: Keep under 50KB for best performance
//    - Location: Place in /public/images/ directory
//    - Example: logoImageUrl: "/images/company-logo.png"
//    - Note: If set, this will override the logoIcon setting
// 4. logoBgColor: Background color behind the icon logo (hex color code)j
//    Only used when logoImageUrl is null/not set
// 5. primaryColor: Main accent color used for buttons, highlights, and interactive elements
//    Used throughout the application for visual consistency
// 6. darkTheme/lightTheme: Complete color schemes for dark and light modes
//    Each theme includes background, card, input, text, and border colors
//
// DEFAULT BRANDING CONFIGURATION
const DEFAULT_BRANDING = {
  // ========== LOGO & SITE IDENTITY ==========
  siteName: "PXM-API-TOOL",
  
  // Icon-based logo (one of: Shield, Lock, Database, Vault)
  // Used when logoImageUrl is null - provides a lightweight icon logo
  logoIcon: "Shield",
  
  // Custom image logo URL (OPTIONAL)
  // Set this to a path to use a custom image instead of an icon
  // Examples:
  //   logoImageUrl: "/images/company-logo.png"  // PNG with transparent background
  //   logoImageUrl: "/images/logo.svg"          // SVG for crisp scaling
  //   logoImageUrl: null                        // Use icon-based logo instead
  //
  // Recommended Image Specifications:
  // - Format: PNG (transparent bg) or SVG
  // - Dimensions: 40x40 pixels (square preferred)
  // - Resolution: 72 DPI minimum
  // - File Size: <50KB for optimal loading
  // - Location: Place files in /public/images/ directory
  //
  // When set, the image will be displayed as a rounded square next to the site name
  logoImageUrl: null,
  
  // ========== COLOR SCHEME - LOGO & BUTTONS ==========
  // Logo background color (only used when logoImageUrl is null)
  // Change this to match your brand identity
  // Format: Hex color code (e.g., "#0066CC", "#FF6600", "#228B22")
  logoBgColor: "#dc2626",
  
  // Primary accent color used for buttons, active states, highlights
  // Applied to deploy buttons, active tabs, and highlight elements
  // Format: Hex color code
  // Examples: Red #dc2626, Blue #0066CC, Green #16a34a
  primaryColor: "#dc2626",
  
  // Reserved for future use
  accentColor: "#0f172a",

  // ========== DARK MODE THEME ==========
  // Complete color scheme for dark mode appearance
  // Customize each color property to match your dark mode branding
  darkTheme: {
    bg: 'bg-[#0f172a]',             // Main page background
    card: 'bg-slate-900',           // Card/section backgrounds
    cardBorder: 'border-slate-800', // Card border color
    input: 'bg-slate-900',          // Form input background
    inputBorder: 'border-slate-700', // Form input border
    text: '#f8fafc',                // Text color (hex format for style attributes)
    navBg: 'bg-slate-900',          // Navigation bar background
    navBorder: 'border-slate-800',  // Navigation bar border
  },

  // ========== LIGHT MODE THEME ==========
  // Complete color scheme for light mode appearance
  // Customize each color property to match your light mode branding
  lightTheme: {
    bg: 'bg-[#f8fafc]',             // Main page background
    card: 'bg-white',               // Card/section backgrounds
    cardBorder: 'border-slate-200', // Card border color
    input: 'bg-white',              // Form input background
    inputBorder: 'border-slate-200', // Form input border
    text: '#0f172a',                // Text color (hex format for style attributes)
    navBg: 'bg-white',              // Navigation bar background
    navBorder: 'border-slate-200',  // Navigation bar border
  }
};

// ============================================================================
// HOW TO CUSTOMIZE THEME COLORS
// ============================================================================
//
// Theme colors use Tailwind CSS class names (e.g. 'bg-slate-900') and hex codes
// 
// To change a theme color:
// 1. For Tailwind class names (cardBorder, navBorder, etc):
//    Use Tailwind utility format: 'border-slate-800' or 'bg-slate-900'
//    Available Tailwind colors: slate, gray, zinc, neutral, stone, red, orange,
//    amber, yellow, lime, green, emerald, teal, cyan, sky, blue, indigo,
//    violet, purple, fuchsia, pink, rose
//    Reference: https://tailwindcss.com/docs/customizing-colors
//
// 2. For hex color codes (text field, used in style attributes):
//    Use 6-digit hex format: '#0f172a' or '#ffffff'
//    Use a color picker: https://htmlcolorcodes.com/
//
// Example: Change dark theme card color to dark blue
//   darkTheme: {
//     card: 'bg-blue-900',
//     ...
//   }
//

// Available icons for logo (used when logoImageUrl is not set)
const AVAILABLE_LOGO_ICONS = {
  'Shield': Shield,
  'Lock': Lock,
  'Database': Database,
  'Vault': Vault,
};

const CONFIG = {
  SITE_NAME: "PXM-API-TOOL",
};

// ============================================================================
// THEME STYLES
// ============================================================================

const THEME = {
  darkBg: 'bg-[#0f172a]',
  darkCard: 'bg-slate-900 border-slate-800',
  darkInput: 'bg-slate-900 border-slate-700 text-white',
  darkText: '#f8fafc',
  lightBg: 'bg-[#f8fafc]',
  lightCard: 'bg-white border-slate-200',
  lightInput: 'bg-white border-slate-200',
  lightText: '#0f172a',
};

const getThemeClasses = (isDark, branding) => {
  const theme = isDark ? branding.darkTheme : branding.lightTheme;
  
  // Extract color values for inline style fallbacks
  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const textColor = theme.text;
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const inputBg = isDark ? '#1e293b' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  
  return {
    bg: theme.bg,
    bgStyle: { backgroundColor: bgColor },
    card: `${theme.card} ${theme.cardBorder}`,
    cardStyle: { backgroundColor: cardBg, borderColor: borderColor },
    input: `${theme.input} ${theme.inputBorder} text-${isDark ? 'white' : 'slate-900'}`,
    inputStyle: { backgroundColor: inputBg, borderColor: borderColor, color: isDark ? '#ffffff' : '#1e293b' },
    text: theme.text,
    textStyle: { color: textColor },
    border: theme.navBorder,
    navBg: `${theme.navBg} ${theme.navBorder}`,
    navBgStyle: { backgroundColor: cardBg, borderColor: borderColor },
    tabActive: isDark ? 'bg-slate-700 text-white' : 'bg-red-600 text-white shadow-sm border',
    tabInactive: 'text-slate-500 hover:text-slate-700',
    buttonPrimary: isDark ? 'bg-red-600' : 'bg-slate-900',
  };
};

// ============================================================================
// NAVIGATION & TAB CONFIGURATION
// ============================================================================

const NAV_TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'DASHBOARD', category: null },
  { id: 'safe-add', icon: Lock, label: 'SAFE', category: 'Adding' },
  { id: 'member-add', icon: Users, label: 'MEMBER', category: 'Adding' },
  { id: 'account-add', icon: Database, label: 'ACCOUNT', category: 'Adding' },
  { id: 'safe-modify', icon: Lock, label: 'SAFE', category: 'Modify' },
  { id: 'member-modify', icon: Users, label: 'MEMBER', category: 'Modify' },
  { id: 'account-modify', icon: Database, label: 'ACCOUNT', category: 'Modify' },
  { id: 'safe-remove', icon: Lock, label: 'SAFE', category: 'Remove' },
  { id: 'member-remove', icon: Users, label: 'MEMBER', category: 'Remove' },
  { id: 'account-remove', icon: Database, label: 'ACCOUNT', category: 'Remove' },
];

const NAV_CATEGORIES = [
  { id: 'Adding', label: 'Adding', color: 'emerald' },
  { id: 'Modify', label: 'Modify', color: 'blue' },
  { id: 'Remove', label: 'Remove', color: 'red' }
];

// Category Icons Mapping
const CATEGORY_ICONS = {
  'Adding': UserRoundPlus,
  'Modify': UserRoundPen,
  'Remove': UserRoundMinus
};

// Category Colors Mapping
const CATEGORY_COLORS = {
  'Adding': { text: 'text-emerald-600', hover: 'hover:text-emerald-700', button: 'text-emerald-600 hover:text-emerald-700' },
  'Modify': { text: 'text-blue-600', hover: 'hover:text-blue-700', button: 'text-blue-600 hover:text-blue-700' },
  'Remove': { text: 'text-red-600', hover: 'hover:text-red-700', button: 'text-red-600 hover:text-red-700' }
};

// Mapping for backward compatibility
const TAB_ID_MAP = {
  'safe-add': 'safe',
  'member-add': 'member',
  'account-add': 'account',
  'safe-modify': 'safe-modify',
  'member-modify': 'member-modify',
  'account-modify': 'account-modify',
  'safe-remove': 'safe-remove',
  'member-remove': 'member-remove',
  'account-remove': 'account-remove'
};

// ============================================================================
// PERMISSIONS DATA
// ============================================================================

const PERM_TEMPLATES = {
  "PAM": { UseAccounts: true, RetrieveAccounts: true, ListAccounts: true, AddAccounts: true, UpdateAccountContent: true, UpdateAccountProperties: true, InitiateCPMAccountManagementOperations: true, SpecifyNextAccountContent: true, RenameAccounts: true, DeleteAccounts: true, UnlockAccounts: true, ManageSafe: true, ManageSafeMembers: true, BackupSafe: true, ViewAuditLog: true, ViewSafeMembers: true, AccessWithoutConfirmation: true, CreateFolders: true, DeleteFolders: true, MoveAccountsAndFolders: true, RequestsAuthorizationLevel1: false, RequestsAuthorizationLevel2: false },
  "SM-HOLDER": { UseAccounts: false, RetrieveAccounts: false, ListAccounts: true, AddAccounts: true, UpdateAccountContent: false, UpdateAccountProperties: true, InitiateCPMAccountManagementOperations: false, SpecifyNextAccountContent: false, RenameAccounts: true, DeleteAccounts: true, UnlockAccounts: false, ManageSafe: false, ManageSafeMembers: true, BackupSafe: false, ViewAuditLog: true, ViewSafeMembers: true, AccessWithoutConfirmation: false, CreateFolders: true, DeleteFolders: true, MoveAccountsAndFolders: true, RequestsAuthorizationLevel1: false, RequestsAuthorizationLevel2: false },
  "SM-PROV": { UseAccounts: true, RetrieveAccounts: true, ListAccounts: true, AddAccounts: false, UpdateAccountContent: false, UpdateAccountProperties: false, InitiateCPMAccountManagementOperations: false, SpecifyNextAccountContent: false, RenameAccounts: false, DeleteAccounts: false, UnlockAccounts: false, ManageSafe: false, ManageSafeMembers: false, BackupSafe: false, ViewAuditLog: false, ViewSafeMembers: true, AccessWithoutConfirmation: true, CreateFolders: false, DeleteFolders: false, MoveAccountsAndFolders: false, RequestsAuthorizationLevel1: false, RequestsAuthorizationLevel2: false },
  "SM-APP": { UseAccounts: true, RetrieveAccounts: true, ListAccounts: true, AddAccounts: true, UpdateAccountContent: true, UpdateAccountProperties: true, InitiateCPMAccountManagementOperations: true, SpecifyNextAccountContent: true, RenameAccounts: true, DeleteAccounts: true, UnlockAccounts: true, ManageSafe: false, ManageSafeMembers: false, BackupSafe: false, ViewAuditLog: true, ViewSafeMembers: true, AccessWithoutConfirmation: false, CreateFolders: true, DeleteFolders: false, MoveAccountsAndFolders: false, RequestsAuthorizationLevel1: false, RequestsAuthorizationLevel2: false },
  "NONE": { UseAccounts: false, RetrieveAccounts: false, ListAccounts: false, AddAccounts: false, UpdateAccountContent: false, UpdateAccountProperties: false, InitiateCPMAccountManagementOperations: false, SpecifyNextAccountContent: false, RenameAccounts: false, DeleteAccounts: false, UnlockAccounts: false, ManageSafe: false, ManageSafeMembers: false, BackupSafe: false, ViewAuditLog: false, ViewSafeMembers: false, AccessWithoutConfirmation: false, CreateFolders: false, DeleteFolders: false, MoveAccountsAndFolders: false, RequestsAuthorizationLevel1: false, RequestsAuthorizationLevel2: false },
  "FULL": { UseAccounts: true, RetrieveAccounts: true, ListAccounts: true, AddAccounts: true, UpdateAccountContent: true, UpdateAccountProperties: true, InitiateCPMAccountManagementOperations: true, SpecifyNextAccountContent: true, RenameAccounts: true, DeleteAccounts: true, UnlockAccounts: true, ManageSafe: true, ManageSafeMembers: true, BackupSafe: true, ViewAuditLog: true, ViewSafeMembers: true, AccessWithoutConfirmation: true, CreateFolders: true, DeleteFolders: true, MoveAccountsAndFolders: true, RequestsAuthorizationLevel1: false, RequestsAuthorizationLevel2: false },
};

const PERMISSION_KEYS = [
  "UseAccounts", "RetrieveAccounts", "ListAccounts", "AddAccounts", "UpdateAccountContent", 
  "UpdateAccountProperties", "InitiateCPMAccountManagementOperations", "SpecifyNextAccountContent", 
  "RenameAccounts", "DeleteAccounts", "UnlockAccounts", "ManageSafe", "ManageSafeMembers", 
  "BackupSafe", "ViewAuditLog", "ViewSafeMembers", "AccessWithoutConfirmation", "CreateFolders", 
  "DeleteFolders", "MoveAccountsAndFolders", "RequestsAuthorizationLevel1", "RequestsAuthorizationLevel2"
];

const GLOBAL_STANDARD_MEMBERS = [
  { member: "G_PAM_ADMINS", domain: "Vault", perms: PERM_TEMPLATES.FULL, role: "Full" },
  { member: "G_PROVISIONING_AUTOMATION", domain: "Vault", perms: PERM_TEMPLATES["SM-PROV"], role: "SM-PROV" },
  { member: "G_APPLICATION_READERS", domain: "Vault", perms: PERM_TEMPLATES["SM-APP"], role: "SM-APP" },
  { member: "G_SAFE_HOLDERS_GLOBAL", domain: "Vault", perms: PERM_TEMPLATES["SM-HOLDER"], role: "SM-HOLDER" }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const detectRoleFromPermissions = (permissions) => {
  for (const [roleName, rolePerms] of Object.entries(PERM_TEMPLATES)) {
    if (JSON.stringify(permissions) === JSON.stringify(rolePerms)) {
      return roleName;
    }
  }
  return 'Custom';
};

// ============================================================================
// NOTIFICATION COMPONENT
// ============================================================================

const NotificationPopup = ({ notification }) => {
  if (!notification) return null;

  const bgColor = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-amber-600',
    info: 'bg-blue-600'
  }[notification.type] || 'bg-blue-600';

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }[notification.type] || 'ℹ';

  return (
    <div className={`fixed top-6 right-6 ${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 z-[9999] max-w-sm`}>
      <span className="text-lg font-bold">{icon}</span>
      <p className="font-medium">{notification.message}</p>
    </div>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [vaultUrl, setVaultUrl] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('cyberark_token') || '');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const closeDropdownTimeout = useRef(null);
  const [notification, setNotification] = useState(null);
  
  // Branding State (loaded from localStorage)
  const [branding] = useState(() => {
    const saved = localStorage.getItem('brandingPreferences');
    return saved ? JSON.parse(saved) : DEFAULT_BRANDING;
  });

  // Notification helper function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // CyberArk Authentication Function
  const authenticate = async () => {
    if (!vaultUrl || !username || !password) {
      const message = 'Please enter PVWA URL, username, and password.';
      setAuthError(message);
      showNotification(message, 'error');
      return;
    }

    try {
      setAuthError('');
      setIsAuthenticating(true);
      showNotification('Authenticating with CyberArk...', 'info');
      
      // CyberArk PVWA Login API Endpoint
      // POST /auth/login - Authenticates user and returns authentication token
      const loginUrl = `${vaultUrl}/auth/login`;
      
      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `Authentication failed: ${loginResponse.statusText}`);
      }

      const loginData = await loginResponse.json();
      
      // Extract token from response
      // CyberArk returns the token directly or in a 'token' property
      const token = loginData.token || loginData;
      
      if (!token) {
        throw new Error('No authentication token received from CyberArk');
      }

      // Store token in state and localStorage
      setAuthToken(token);
      localStorage.setItem('cyberark_token', token);
      
      // Store the vault URL for use in API calls
      localStorage.setItem('cyberark_url', vaultUrl);
      
      // Clear password from state for security
      setPassword('');
      
      // Mark as logged in
      setIsLoggedIn(true);
      showNotification('✓ Successfully authenticated with CyberArk!', 'success');
    } catch (error) {
      const errorMessage = error?.message || 'Authentication failed. Please verify your credentials and try again.';
      setAuthError(errorMessage);
      showNotification(`✗ Authentication failed: ${errorMessage}`, 'error');
      console.error('Authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Safe Management State
  const [customSafeName, setCustomSafeName] = useState('');
  const [safeDescription, setSafeDescription] = useState('');
  const [managingCPM, setManagingCPM] = useState('');
  const [retentionMode, setRetentionMode] = useState('versions'); // 'versions' or 'days'
  const [versionRetention, setVersionRetention] = useState('');
  const [daysRetention, setDaysRetention] = useState('');
  const [stagedSafes, setStagedSafes] = useState([]);

  // Member Management State
  const [targetSafe, setTargetSafe] = useState('');
  const [memberName, setMemberName] = useState('');
  const [memberDomain, setMemberDomain] = useState('Vault');
  const [memberPermissions, setMemberPermissions] = useState({});
  const [stagedMembers, setStagedMembers] = useState([]);
  const [standardMembersSelection, setStandardMembersSelection] = useState({});
  const [editingStandardMember, setEditingStandardMember] = useState(null);
  const [standardMembersPermissions, setStandardMembersPermissions] = useState({});
  const [managedStandardMembers, setManagedStandardMembers] = useState([...GLOBAL_STANDARD_MEMBERS]);
  const [editingMemberInModal, setEditingMemberInModal] = useState(null);
  const [newMemberForm, setNewMemberForm] = useState({ member: '', domain: 'Vault', role: '', perms: {} });

  // Account Management State
  const [accObject, setAccObject] = useState('');
  const [accAddress, setAccAddress] = useState('');
  const [accUsername, setAccUsername] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accPlatformId, setAccPlatformId] = useState('');
  const [accSafeName, setAccSafeName] = useState('');
  const [accAutoMgmt, setAccAutoMgmt] = useState(true);
  const [accManualReason, setAccManualReason] = useState('');
  const [accRemoteMachines, setAccRemoteMachines] = useState('');
  const [stagedAccounts, setStagedAccounts] = useState([]);

  // Safe Removal State
  const [availableSafesForRemoval, setAvailableSafesForRemoval] = useState([
    { id: 'SAFE-001', name: 'Legacy-Database', managingCPM: 'CyberArk', numberOfVersionsRetention: 10, numberOfDaysRetention: null },
    { id: 'SAFE-002', name: 'Test-Environment', managingCPM: 'VaultManager', numberOfVersionsRetention: null, numberOfDaysRetention: 30 },
    { id: 'SAFE-003', name: 'Archive-2022', managingCPM: 'CyberArk', numberOfVersionsRetention: 5, numberOfDaysRetention: null },
  ]);
  const [selectedSafesForRemoval, setSelectedSafesForRemoval] = useState({});
  const [safeRemovalFilter, setSafeRemovalFilter] = useState('');
  const [stagedSafeRemovals, setStagedSafeRemovals] = useState([]);

  // Member Removal State
  const [availableMembersForRemoval, setAvailableMembersForRemoval] = useState([
    { id: 'MEM-001', member: 'user.departed', domain: 'DOMAIN', safe: 'SAFE-001', role: 'Contributor'},
    { id: 'MEM-002', member: 'temp.contractor', domain: 'DOMAIN', safe: 'SAFE-002', role: 'Auditor'},
    { id: 'MEM-003', member: 'old.admin', domain: 'Vault', safe: 'SAFE-001', role: 'Manager'},
  ]);
  const [selectedMembersForRemoval, setSelectedMembersForRemoval] = useState({});
  const [memberRemovalFilter, setMemberRemovalFilter] = useState('');
  const [memberRemovalSafeFilter, setMemberRemovalSafeFilter] = useState('');
  const [stagedMemberRemovals, setStagedMemberRemovals] = useState([]);

  // Account Removal State
  const [availableAccountsForRemoval, setAvailableAccountsForRemoval] = useState([
    { id: 'ACC-001', object: 'root', username: 'admin_user', address: '192.168.1.10', platform: 'Linux', safeName: 'SAFE-001'},
    { id: 'ACC-002', object: 'sa', username: 'db_admin', address: 'db-server.local', platform: 'SQLServer', safeName: 'SAFE-002'},
    { id: 'ACC-003', object: 'admin', username: 'system_admin', address: '10.0.0.5', platform: 'Windows', safeName: 'SAFE-003'},
  ]);
  const [selectedAccountsForRemoval, setSelectedAccountsForRemoval] = useState({});
  const [accountRemovalFilter, setAccountRemovalFilter] = useState('');
  const [accountRemovalSafeFilter, setAccountRemovalSafeFilter] = useState('');
  const [stagedAccountRemovals, setStagedAccountRemovals] = useState([]);

  // Safe Modification State
  const [availableSafesForModification, setAvailableSafesForModification] = useState([
    { id: 'SAFE-001', name: 'Legacy-Database', managingCPM: 'CyberArk', numberOfVersionsRetention: 10, numberOfDaysRetention: null },
    { id: 'SAFE-002', name: 'Test-Environment', managingCPM: 'VaultManager', numberOfVersionsRetention: null, numberOfDaysRetention: 30 },
    { id: 'SAFE-003', name: 'Archive-2022', managingCPM: 'CyberArk', numberOfVersionsRetention: 5, numberOfDaysRetention: null },
  ]);
  const [editingSafeId, setEditingSafeId] = useState(null);
  const [editedSafeData, setEditedSafeData] = useState({});
  const [safeModificationFilter, setSafeModificationFilter] = useState('');
  const [stagedSafeModifications, setStagedSafeModifications] = useState([]);

  // Member Modification State
  const [availableMembersForModification, setAvailableMembersForModification] = useState([
    { id: 'MEM-001', member: 'user.departed', domain: 'DOMAIN', safe: 'SAFE-001', role: 'Contributor'},
    { id: 'MEM-002', member: 'temp.contractor', domain: 'DOMAIN', safe: 'SAFE-002', role: 'Auditor'},
    { id: 'MEM-003', member: 'old.admin', domain: 'Vault', safe: 'SAFE-001', role: 'Manager'},
  ]);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editedMemberData, setEditedMemberData] = useState({});
  const [memberModificationFilter, setMemberModificationFilter] = useState('');
  const [memberModificationSafeFilter, setMemberModificationSafeFilter] = useState('');
  const [stagedMemberModifications, setStagedMemberModifications] = useState([]);

  // Account Modification State
  const [availableAccountsForModification, setAvailableAccountsForModification] = useState([
    { id: 'ACC-001', object: 'root', username: 'admin_user', address: '192.168.1.10', platform: 'Linux', safeName: 'SAFE-001'},
    { id: 'ACC-002', object: 'sa', username: 'db_admin', address: 'db-server.local', platform: 'SQLServer', safeName: 'SAFE-002'},
    { id: 'ACC-003', object: 'admin', username: 'system_admin', address: '10.0.0.5', platform: 'Windows', safeName: 'SAFE-003'},
  ]);
  const [editingAccountId, setEditingAccountId] = useState(null);
  const [editedAccountData, setEditedAccountData] = useState({});
  const [accountModificationFilter, setAccountModificationFilter] = useState('');
  const [accountModificationSafeFilter, setAccountModificationSafeFilter] = useState('');
  const [stagedAccountModifications, setStagedAccountModifications] = useState([]);

  // Connection Status State
  const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');

  // ========================================================================
  // COMPUTED VALUES & EFFECTS
  // ========================================================================

  const themeClasses = getThemeClasses(isDark, branding);

  // Update connection status based on authentication
  useEffect(() => {
    if (authToken && isLoggedIn) {
      setConnectionStatus('CONNECTED');
    } else {
      setConnectionStatus('DISCONNECTED');
    }
  }, [authToken, isLoggedIn]);

  // Update dark mode class on html element
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  // Fetch Safes when accessing safe-modify or safe-remove tabs
  useEffect(() => {
    if ((activeTab === 'safe-modify' || activeTab === 'safe-remove') && authToken && safeAPI) {
      const fetchSafes = async () => {
        try {
          const safes = await safeAPI.getAll();
          // Convert API response to our format
          const formattedSafes = Array.isArray(safes) ? safes.map(safe => ({
            id: safe.safeName || safe.id,
            name: safe.safeName || safe.name,
            managingCPM: safe.managingCPM || 'CyberArk',
            numberOfVersionsRetention: safe.numberOfVersionsRetention || null,
            numberOfDaysRetention: safe.numberOfDaysRetention || null
          })) : [];
          
          // Update both removal and modification arrays
          setAvailableSafesForRemoval(formattedSafes);
          setAvailableSafesForModification(formattedSafes);
        } catch (error) {
          console.error('Failed to fetch safes:', error);
          // Keep existing data on error
        }
      };
      fetchSafes();
    }
  }, [activeTab, authToken]);

  // Fetch Members when accessing member-modify or member-remove tabs
  useEffect(() => {
    if ((activeTab === 'member-modify' || activeTab === 'member-remove') && authToken && memberAPI) {
      const fetchMembers = async () => {
        try {
          // Try to fetch all members - API should support getting all members across safes
          const members = await memberAPI.getBySafe('');
          // Convert API response to our format
          const formattedMembers = Array.isArray(members) ? members.map(member => ({
            id: member.id || member.memberName,
            member: member.memberName || member.member,
            domain: member.searchIn || member.domain || 'Domain',
            safe: member.safeName || member.safe,
            role: member.role || 'Contributor'
          })) : [];
          
          // Update both removal and modification arrays
          setAvailableMembersForRemoval(formattedMembers);
          setAvailableMembersForModification(formattedMembers);
        } catch (error) {
          console.error('Failed to fetch members:', error);
          // Keep existing data on error
        }
      };
      fetchMembers();
    }
  }, [activeTab, authToken]);

  // Fetch Accounts when accessing account-modify or account-remove tabs
  useEffect(() => {
    if ((activeTab === 'account-modify' || activeTab === 'account-remove') && authToken && accountAPI) {
      const fetchAccounts = async () => {
        try {
          const accounts = await accountAPI.getAll();
          // Convert API response to our format
          const formattedAccounts = Array.isArray(accounts) ? accounts.map(account => ({
            id: account.id || account.object,
            object: account.id || account.object,
            username: account.userName || account.username,
            address: account.address,
            platform: account.platformId || account.platform,
            safeName: account.safeName || account.safe
          })) : [];
          
          // Update both removal and modification arrays
          setAvailableAccountsForRemoval(formattedAccounts);
          setAvailableAccountsForModification(formattedAccounts);
        } catch (error) {
          console.error('Failed to fetch accounts:', error);
          // Keep existing data on error
        }
      };
      fetchAccounts();
    }
  }, [activeTab, authToken]);

  const handleAddSafeToStage = () => {
    if (!customSafeName.trim()) {
      return showNotification("Please enter a Safe name!", "error");
    }
    const retentionValue = retentionMode === 'versions' ? versionRetention : daysRetention;
    if (!retentionValue) {
      return showNotification(`Please enter ${retentionMode === 'versions' ? 'number of versions' : 'number of days'} for retention!`, "error");
    }
    const newSafe = {
      name: customSafeName,
      description: safeDescription,
      CPMManaging: managingCPM,
      retentionMode: retentionMode,
      retentionValue: retentionValue
    };
    setStagedSafes([...stagedSafes, newSafe]);
    setCustomSafeName('');
    setSafeDescription('');
    setManagingCPM('');
    setRetentionMode('versions');
    setVersionRetention('');
    setDaysRetention('');
  };

  // ========================================================================
  // EVENT HANDLERS - Member Management
  // ========================================================================

  const handleAddStandardMembers = () => {
    if (!targetSafe) return showNotification("Please specify a target Safe!", "error");
    const selectedMembers = Object.keys(standardMembersSelection).filter(key => standardMembersSelection[key]);
    if (selectedMembers.length === 0) return showNotification("Please select at least one standard member!", "error");
    
    const newEntries = selectedMembers.map(memberKey => {
      const member = managedStandardMembers.find(m => m.member === memberKey);
      const perms = standardMembersPermissions[memberKey] ? { ...standardMembersPermissions[memberKey] } : { ...member.perms };
      return {
        safe: targetSafe,
        member: member.member,
        domain: member.domain,
        perms: perms,
        roleLabel: detectRoleFromPermissions(perms)
      };
    });
    setStagedMembers([...stagedMembers, ...newEntries]);
    setStandardMembersSelection({});
    setStandardMembersPermissions({});
  };

  const handleAddCustomMember = () => {
    if (!targetSafe || !memberName) return showNotification("Please specify a target Safe and member name!", "error");
    const detectedRole = detectRoleFromPermissions(memberPermissions);
    setStagedMembers([...stagedMembers, {
      safe: targetSafe,
      member: memberName,
      domain: memberDomain,
      perms: { ...memberPermissions },
      roleLabel: detectedRole
    }]);
    setMemberName('');
  };

  // ========================================================================
  // EVENT HANDLERS - Account Management
  // ========================================================================

  const handleAddAccountToQueue = () => {
    if (!accObject || !accAddress || !accUsername || !accPlatformId || !accSafeName) {
      return showNotification("Please fill required fields!", "error");
    }
    setStagedAccounts([...stagedAccounts, {
      object: accObject,
      address: accAddress,
      userName: accUsername,
      secret: accPassword,
      platformId: accPlatformId,
      safeName: accSafeName,
      automaticManagement: accAutoMgmt,
      manualManagementReason: accAutoMgmt ? '' : accManualReason,
      remoteMachines: accRemoteMachines
    }]);
    // Reset form
    setAccAddress('');
    setAccUsername('');
    setAccManualReason('');
    setAccObject('');
    setAccPassword('');
    setAccRemoteMachines('');
  };

  // ========================================================================
  // EVENT HANDLERS - Safe Removal
  // ========================================================================

  const handleStageSafeRemovals = () => {
    const selectedIds = Object.keys(selectedSafesForRemoval).filter(key => selectedSafesForRemoval[key]);
    if (selectedIds.length === 0) {
      return showNotification("Please select at least one Safe to remove!", "error");
    }
    const itemsToRemove = availableSafesForRemoval.filter(safe => 
      selectedIds.includes(safe.id) && !stagedSafeRemovals.some(staged => staged.id === safe.id)
    );
    if (itemsToRemove.length === 0) {
      return showNotification("All selected Safes are already queued!", "warning");
    }
    setStagedSafeRemovals([...stagedSafeRemovals, ...itemsToRemove]);
    setSelectedSafesForRemoval({});
    setSafeRemovalFilter('');
  };

  // ========================================================================
  // EVENT HANDLERS - Member Removal
  // ========================================================================

  const handleStageMemberRemovals = () => {
    const selectedIds = Object.keys(selectedMembersForRemoval).filter(key => selectedMembersForRemoval[key]);
    if (selectedIds.length === 0) {
      return showNotification("Please select at least one Member to remove!", "error");
    }
    const itemsToRemove = availableMembersForRemoval.filter(member => selectedIds.includes(member.id));
    const stagedIds = stagedMemberRemovals.map(m => m.id);
    const duplicates = itemsToRemove.filter(item => stagedIds.includes(item.id));
    if (duplicates.length > 0) {
      return showNotification(`The following member(s) are already staged for removal: ${duplicates.map(d => d.member).join(', ')}`, "warning");
    }
    setStagedMemberRemovals([...stagedMemberRemovals, ...itemsToRemove]);
    setSelectedMembersForRemoval({});
    setMemberRemovalFilter('');
    setMemberRemovalSafeFilter('');
  };

  // ========================================================================
  // EVENT HANDLERS - Account Removal
  // ========================================================================

  const handleStageAccountRemovals = () => {
    const selectedIds = Object.keys(selectedAccountsForRemoval).filter(key => selectedAccountsForRemoval[key]);
    if (selectedIds.length === 0) {
      return showNotification("Please select at least one Account to remove!", "error");
    }
    const itemsToRemove = availableAccountsForRemoval.filter(account => selectedIds.includes(account.id));
    const stagedIds = stagedAccountRemovals.map(a => a.id);
    const duplicates = itemsToRemove.filter(item => stagedIds.includes(item.id));
    if (duplicates.length > 0) {
      return showNotification(`The following account(s) are already staged for removal: ${duplicates.map(d => d.username).join(', ')}`, "warning");
    }
    setStagedAccountRemovals([...stagedAccountRemovals, ...itemsToRemove]);
    setSelectedAccountsForRemoval({});
    setAccountRemovalFilter('');
    setAccountRemovalSafeFilter('');
  };

  // ========================================================================
  // EVENT HANDLERS - Safe Modification
  // ========================================================================

  const handleSaveModifiedSafe = (safeId) => {
    const baseSafe = availableSafesForModification.find(s => s.id === safeId);
    
    // Determine retention type from editedSafeData or existing safe
    const retentionType = editedSafeData.retentionType || (baseSafe.numberOfVersionsRetention ? 'versions' : 'days');
    const retentionValue = editedSafeData.retentionValue || 
      (retentionType === 'versions' ? baseSafe.numberOfVersionsRetention : baseSafe.numberOfDaysRetention);
    
    const editedSafe = {
      ...baseSafe,
      managingCPM: editedSafeData.managingCPM !== undefined ? editedSafeData.managingCPM : baseSafe.managingCPM,
      numberOfVersionsRetention: retentionType === 'versions' ? retentionValue : undefined,
      numberOfDaysRetention: retentionType === 'days' ? retentionValue : undefined
    };
    
    const stagedIds = stagedSafeModifications.map(s => s.id);
    if (stagedIds.includes(safeId)) {
      setStagedSafeModifications(stagedSafeModifications.map(s => s.id === safeId ? editedSafe : s));
      showNotification(`Safe "${editedSafe.name}" updated in staging!`, "success");
    } else {
      setStagedSafeModifications([...stagedSafeModifications, editedSafe]);
      showNotification(`Safe "${editedSafe.name}" staged for modification!`, "success");
    }
    setEditingSafeId(null);
    setEditedSafeData({});
  };

  // ========================================================================
  // EVENT HANDLERS - Member Modification
  // ========================================================================

  const handleSaveModifiedMember = (memberId) => {
    const baseMember = availableMembersForModification.find(m => m.id === memberId);
    const editedMember = {
      ...baseMember,
      ...editedMemberData,
      // Auto-detect role from permissions
      role: detectRoleFromPermissions(editedMemberData.perms || baseMember.perms || {})
    };
    const stagedIds = stagedMemberModifications.map(m => m.id);
    if (stagedIds.includes(memberId)) {
      setStagedMemberModifications(stagedMemberModifications.map(m => m.id === memberId ? editedMember : m));
      showNotification(`Member "${editedMember.member}" updated in staging!`, "success");
    } else {
      setStagedMemberModifications([...stagedMemberModifications, editedMember]);
      showNotification(`Member "${editedMember.member}" staged for modification!`, "success");
    }
    setEditingMemberId(null);
    setEditedMemberData({});
  };

  // ========================================================================
  // EVENT HANDLERS - Account Modification
  // ========================================================================

  const handleSaveModifiedAccount = (accountId) => {
    const editedAccount = {
      ...availableAccountsForModification.find(a => a.id === accountId),
      ...editedAccountData
    };
    const stagedIds = stagedAccountModifications.map(a => a.id);
    if (stagedIds.includes(accountId)) {
      setStagedAccountModifications(stagedAccountModifications.map(a => a.id === accountId ? editedAccount : a));
      showNotification(`Account "${editedAccount.username}" updated in staging!`, "success");
    } else {
      setStagedAccountModifications([...stagedAccountModifications, editedAccount]);
      showNotification(`Account "${editedAccount.username}" staged for modification!`, "success");
    }
    setEditingAccountId(null);
    setEditedAccountData({});
  };

  // ========================================================================
  // RENDER - Logo Component
  // ========================================================================

  const LogoComponent = () => {
    const LogoIcon = AVAILABLE_LOGO_ICONS[branding.logoIcon] || Shield;
    return (
      <div className="flex items-center gap-3">
        {branding.logoImageUrl ? (
          // Custom image logo
          <div className="flex-shrink-0 rounded-xl shadow-md overflow-hidden">
            <img
              src={branding.logoImageUrl}
              alt="Logo"
              className="h-10 w-10 object-cover"
            />
          </div>
        ) : (
          // Icon-based logo
          <div className="p-2 rounded-xl shadow-md flex-shrink-0" style={{ backgroundColor: branding.logoBgColor }}>
            <LogoIcon size={20} color="white" />
          </div>
        )}
        <div className="text-left">
          <span
            style={{ color: themeClasses.text }}
            className="font-black text-xl tracking-tight block leading-none"
          >
            {branding.siteName}
          </span>
        </div>
      </div>
    );
  };

  const DebugModeIndicator = () => {
    if (!DEBUG_MODE) return null;

    return (
      <div className="fixed bottom-4 right-4 z-10 pointer-events-none px-4 py-2 rounded-full bg-amber-500/90 text-slate-900 text-xs font-black uppercase tracking-widest shadow-lg border border-amber-600">
        🔧 Debug Mode Enabled
      </div>
    );
  };

  // ========================================================================
  // DYNAMIC API LAYER - CyberArk REST API with Current Auth State
  // ========================================================================
  
  // Create dynamic API functions that use current authToken and vaultUrl from state
  const { makeAPIRequest, safeAPI, memberAPI, accountAPI } = useMemo(() => {
    // Get the base URL from vaultUrl state (append /api if not already present)
    const baseURL = vaultUrl && vaultUrl.endsWith('/api') ? vaultUrl : `${vaultUrl}/api`;
    const token = authToken;

    /**
     * Generic API request wrapper for CyberArk REST calls
     * Handles Bearer token authentication, error handling, and JSON serialization
     */
    const makeAPIRequest = async (endpoint, options = {}) => {
      const url = `${baseURL}${endpoint}`;
      
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };
      
      const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: { ...defaultOptions.headers, ...options.headers }
      };
      
      try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || errorData.message || 
            `API Error ${response.status}: ${response.statusText}`
          );
        }
        
        return await response.json().catch(() => ({}));
      } catch (error) {
        throw new Error(`CyberArk API Request Failed: ${error.message}`);
      }
    };

    /**
     * Safe Management API (CyberArk Official REST API)
     * https://docs.cyberark.com/Product-Doc/OnlineHelp/PAS/Latest/en/Content/API/GetSafe.htm
     */
    const safeAPI = {
      // POST /api/safes - Create a new Safe
      create: async (safeData) => {
        const payload = {
          safeName: safeData.name,
          description: safeData.description || '',
          managingCPM: safeData.managingCPM,
          numberOfVersionsRetention: safeData.numberOfVersionsRetention || null,
          numberOfDaysRetention: safeData.numberOfDaysRetention || null
        };
        
        return makeAPIRequest('/safes', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      
      // GET /api/safes - Get all Safes
      getAll: async () => {
        return makeAPIRequest('/safes', { method: 'GET' });
      },
      
      // GET /api/safes/{safeId} - Get Safe by ID
      getById: async (safeId) => {
        return makeAPIRequest(`/safes/${encodeURIComponent(safeId)}`, { method: 'GET' });
      },
      
      // PUT /api/safes/{safeId} - Update Safe
      update: async (safeId, updateData) => {
        const payload = {};
        if (updateData.description !== undefined) payload.description = updateData.description;
        if (updateData.managingCPM !== undefined) payload.managingCPM = updateData.managingCPM;
        if (updateData.numberOfVersionsRetention !== undefined) payload.numberOfVersionsRetention = updateData.numberOfVersionsRetention;
        if (updateData.numberOfDaysRetention !== undefined) payload.numberOfDaysRetention = updateData.numberOfDaysRetention;
        
        return makeAPIRequest(`/safes/${encodeURIComponent(safeId)}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      
      // DELETE /api/safes/{safeId} - Delete Safe
      delete: async (safeId) => {
        return makeAPIRequest(`/safes/${encodeURIComponent(safeId)}`, {
          method: 'DELETE'
        });
      }
    };

    /**
     * Member Management API (CyberArk Official REST API)
     * https://docs.cyberark.com/Product-Doc/OnlineHelp/PAS/Latest/en/Content/API/AddMemberToSafe.htm
     * https://docs.cyberark.com/pam-self-hosted/latest/en/content/webservices/safe%20members.htm
     */
    const memberAPI = {
      // POST /api/safes/{safeId}/members - Add member to Safe
      add: async (safeName, memberData) => {
        const payload = {
          memberName: memberData.member || memberData.memberName,
          memberType: 'Domain',
          searchIn: memberData.domain || 'Domain',
          permissions: memberData.perms || {}
        };
        
        return makeAPIRequest(`/safes/${encodeURIComponent(safeName)}/members`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      
      // GET /api/safes/{safeId}/members - Get members of Safe
      getBySafe: async (safeName) => {
        return makeAPIRequest(`/safes/${encodeURIComponent(safeName)}/members`, {
          method: 'GET'
        });
      },
      
      // PUT /api/safes/{safeId}/members/{memberId} - Update member permissions
      updatePermissions: async (safeName, memberName, permissions) => {
        const payload = {
          permissions: permissions || {}
        };
        
        return makeAPIRequest(
          `/safes/${encodeURIComponent(safeName)}/members/${encodeURIComponent(memberName)}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload)
          }
        );
      },
      
      // DELETE /api/safes/{safeId}/members/{memberId} - Remove member from Safe
      remove: async (safeName, memberName) => {
        return makeAPIRequest(
          `/safes/${encodeURIComponent(safeName)}/members/${encodeURIComponent(memberName)}`,
          {
            method: 'DELETE'
          }
        );
      }
    };

    /**
     * Account Management API (CyberArk Official REST API)
     * https://docs.cyberark.com/Product-Doc/OnlineHelp/PAS/Latest/en/Content/API/AddAccount.htm
     */
    const accountAPI = {
      // POST /api/accounts - Create new Account
      create: async (accountData) => {
        const payload = {
          name: accountData.userName,
          address: accountData.address,
          userName: accountData.userName,
          secret: accountData.secret,
          platformId: accountData.platformId,
          safeName: accountData.safeName,
          automaticManagementEnabled: accountData.automaticManagement === true,
          manualManagementReason: accountData.manualManagementReason || null,
          remoteMachinesAccess: accountData.remoteMachines ? 'Yes' : 'No'
        };
        
        // Add object ID if provided (for existing accounts)
        if (accountData.object) {
          payload.id = accountData.object;
        }
        
        return makeAPIRequest('/accounts', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      },
      
      // GET /api/accounts - Get all Accounts
      getAll: async () => {
        return makeAPIRequest('/accounts', { method: 'GET' });
      },
      
      // GET /api/accounts?search={query} - Search for Accounts
      search: async (query) => {
        return makeAPIRequest(`/accounts?search=${encodeURIComponent(query)}`, {
          method: 'GET'
        });
      },
      
      // PUT /api/accounts/{accountId} - Update Account
      update: async (accountId, updateData) => {
        const payload = {};
        if (updateData.address !== undefined) payload.address = updateData.address;
        if (updateData.secret !== undefined) payload.secret = updateData.secret;
        if (updateData.userName !== undefined) payload.userName = updateData.userName;
        if (updateData.automaticManagement !== undefined) payload.automaticManagementEnabled = updateData.automaticManagement;
        if (updateData.manualManagementReason !== undefined) payload.manualManagementReason = updateData.manualManagementReason;
        
        return makeAPIRequest(`/accounts/${encodeURIComponent(accountId)}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      },
      
      // DELETE /api/accounts/{accountId} - Delete Account
      delete: async (accountId) => {
        return makeAPIRequest(`/accounts/${encodeURIComponent(accountId)}`, {
          method: 'DELETE'
        });
      }
    };

    return { makeAPIRequest, safeAPI, memberAPI, accountAPI };
  }, [authToken, vaultUrl]);

  // ========================================================================
  // RENDER - Login Screen
  // ========================================================================

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 transition-all duration-500 ${themeClasses.bg}`} style={themeClasses.bgStyle}>
        <DebugModeIndicator />
        <div className={`p-10 rounded-[2.5rem] shadow-2xl w-full max-w-sm border ${themeClasses.card}`} style={themeClasses.cardStyle}>
          <div className="flex justify-center mb-10">
            <LogoComponent />
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={vaultUrl}
              onChange={(e) => {
                setVaultUrl(e.target.value);
                if (authError) setAuthError('');
              }}
              placeholder="PVWA URL"
              className={`w-full p-3.5 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
              style={themeClasses.inputStyle}
            />
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (authError) setAuthError('');
              }}
              placeholder="Username"
              className={`w-full p-3.5 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
              style={themeClasses.inputStyle}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) setAuthError('');
              }}
              placeholder="Password"
              className={`w-full p-3.5 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
              style={themeClasses.inputStyle}
            />
            <button
              onClick={authenticate}
              disabled={isAuthenticating}
              className="w-full bg-red-600 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest transition-all hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
            </button>
            
            {/* DEBUG MODE BUTTON - Only shown when DEBUG_MODE is enabled */}
            {DEBUG_MODE && (
              <button
                onClick={() => {
                  // Set debug/test credentials
                  setVaultUrl('https://cyberark-dev.local:8443');
                  setAuthToken('debug_token_' + Date.now());
                  localStorage.setItem('cyberark_token', 'debug_token_' + Date.now());
                  localStorage.setItem('cyberark_url', 'https://cyberark-dev.local:8443');
                  setIsLoggedIn(true);
                  showNotification('✓ Debug mode enabled - bypassing authentication', 'success');
                }}
                className="w-full bg-slate-700 hover:bg-slate-800 text-white font-black py-3 rounded-xl shadow-lg uppercase tracking-widest transition-all text-xs"
              >
                🔧 Debug Mode (Skip Login)
              </button>
            )}

            {authError && (
              <div className="rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert" aria-live="polite">
                {authError}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================================================================
  // RENDER - Main Application
  // ========================================================================

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses.bg}`} style={themeClasses.bgStyle}>
      <DebugModeIndicator />
      {/* Notification Popup */}
      <NotificationPopup notification={notification} />
      
      {/* Navigation Bar */}
      <nav className={`sticky top-0 z-50 border-b transition-all ${themeClasses.navBg}`} style={themeClasses.navBgStyle}>
        <div className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
          <LogoComponent />
          
          {/* Tab Navigation */}
          <div className={`flex gap-2 items-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl p-1`}>
            {/* Dashboard Button */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === 'dashboard' ? themeClasses.tabActive : themeClasses.tabInactive
              }`}
            >
              <LayoutDashboard size={14} /> DASHBOARD
            </button>

            {/* Dropdown Factory Function */}
            {NAV_CATEGORIES.map((category) => (
              <div 
                key={category.id}
                className="relative"
                onMouseEnter={() => {
                  if (closeDropdownTimeout.current) clearTimeout(closeDropdownTimeout.current);
                  setHoveredCategory(category.id);
                }}
                onMouseLeave={() => {
                  closeDropdownTimeout.current = setTimeout(() => {
                    setHoveredCategory(null);
                  }, 150);
                }}
              >
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
                    NAV_TABS.filter(tab => tab.category === category.id).some(tab => activeTab === TAB_ID_MAP[tab.id])
                      ? `${CATEGORY_COLORS[category.id].text} font-extrabold` 
                      : `${themeClasses.tabInactive} hover:${CATEGORY_COLORS[category.id].button}`
                  }`}
                >
                  {React.createElement(CATEGORY_ICONS[category.id], { size: 14 })} {category.label.toUpperCase()}
                </button>

                {/* Dropdown Menu */}
                {hoveredCategory === category.id && (
                  <div className={`absolute top-full left-0 mt-0 rounded-lg shadow-lg border ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} min-w-[150px] z-50 py-1`}>
                    {NAV_TABS.filter(tab => tab.category === category.id).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(TAB_ID_MAP[tab.id]);
                          setHoveredCategory(null);
                        }}
                        className={`w-full text-left flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold transition-all first:rounded-t-lg last:rounded-b-lg ${
                          activeTab === TAB_ID_MAP[tab.id] 
                            ? 'bg-red-600 text-white' 
                            : isDark ? 'hover:bg-slate-800 text-slate-100' : 'hover:bg-slate-100 text-slate-900'
                        }`}
                      >
                        <tab.icon size={14} /> {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Review & Deploy Button */}
            <button
              onClick={() => setActiveTab('review-deploy')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
                activeTab === 'review-deploy' ? themeClasses.tabActive : themeClasses.tabInactive
              }`}
            >
              <Send size={14} /> REVIEW & DEPLOY
            </button>
          </div>

          {/* Theme & Logout Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2.5 rounded-xl border transition-all ${themeClasses.border}`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} color="yellow" /> : <Moon size={18} color="#475569" />}
            </button>
            <button
              onClick={() => {
                // Clear authentication state
                setIsLoggedIn(false);
                setAuthToken('');
                setVaultUrl('');
                setUsername('');
                localStorage.removeItem('cyberark_token');
                localStorage.removeItem('cyberark_url');
                showNotification('✓ Logged out successfully', 'success');
              }}
              className={`p-2.5 rounded-xl border transition-all text-slate-400 ${themeClasses.border}`}
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Accounts Detected"
              count={stagedAccounts.length}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <StatsCard
              title="Safes Detected"
              count={stagedSafes.length}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <StatsCard
              title="API Status"
              count={connectionStatus}
              isDark={isDark}
              themeClasses={themeClasses}
              isStatus
            />
          </div>
        )}

        {/* Safe Management Tab */}
        {activeTab === 'safe' && (
          <>
            <SafeManagementSection
              customSafeName={customSafeName}
              setCustomSafeName={setCustomSafeName}
              safeDescription={safeDescription}
              setSafeDescription={setSafeDescription}
              managingCPM={managingCPM}
              setManagingCPM={setManagingCPM}
              retentionMode={retentionMode}
              setRetentionMode={setRetentionMode}
              versionRetention={versionRetention}
              setVersionRetention={setVersionRetention}
              daysRetention={daysRetention}
              setDaysRetention={setDaysRetention}
              onAddSafe={handleAddSafeToStage}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <QueueSection
              title="Safe Creation Queue"
              items={stagedSafes}
              onRemove={(idx) => setStagedSafes(stagedSafes.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isSafe
            />
          </>
        )}

        {/* Member Management Tab */}
        {activeTab === 'member' && (
          <>
            <MemberManagementSection
              targetSafe={targetSafe}
              setTargetSafe={setTargetSafe}
              memberName={memberName}
              setMemberName={setMemberName}
              memberDomain={memberDomain}
              setMemberDomain={setMemberDomain}
              memberPermissions={memberPermissions}
              setMemberPermissions={setMemberPermissions}
              onAddStandardMembers={handleAddStandardMembers}
              onAddCustomMember={handleAddCustomMember}
              isDark={isDark}
              themeClasses={themeClasses}
              standardMembersSelection={standardMembersSelection}
              setStandardMembersSelection={setStandardMembersSelection}
              editingStandardMember={editingStandardMember}
              setEditingStandardMember={setEditingStandardMember}
              standardMembersPermissions={standardMembersPermissions}
              setStandardMembersPermissions={setStandardMembersPermissions}
              managedStandardMembers={managedStandardMembers}
              setManagedStandardMembers={setManagedStandardMembers}
              editingMemberInModal={editingMemberInModal}
              setEditingMemberInModal={setEditingMemberInModal}
              newMemberForm={newMemberForm}
              setNewMemberForm={setNewMemberForm}
            />
            <QueueSection
              title="Member Creation Queue"
              items={stagedMembers}
              onRemove={(idx) => setStagedMembers(stagedMembers.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isMember
            />
          </>
        )}

        {/* Account Management Tab */}
        {activeTab === 'account' && (
          <>
            <AccountManagementSection
              accObject={accObject}
              setAccObject={setAccObject}
              accAddress={accAddress}
              setAccAddress={setAccAddress}
              accUsername={accUsername}
              setAccUsername={setAccUsername}
              accPassword={accPassword}
              setAccPassword={setAccPassword}
              accPlatformId={accPlatformId}
              setAccPlatformId={setAccPlatformId}
              accSafeName={accSafeName}
              setAccSafeName={setAccSafeName}
              accAutoMgmt={accAutoMgmt}
              setAccAutoMgmt={setAccAutoMgmt}
              accManualReason={accManualReason}
              setAccManualReason={setAccManualReason}
              accRemoteMachines={accRemoteMachines}
              setAccRemoteMachines={setAccRemoteMachines}
              onAddAccount={handleAddAccountToQueue}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <QueueSection
              title="Account Creation Queue"
              items={stagedAccounts}
              onRemove={(idx) => setStagedAccounts(stagedAccounts.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isAccount
            />
          </>
        )}

        {/* Safe Modification Tab */}
        {activeTab === 'safe-modify' && (
          <>
            <SafeModifySection
              availableSafesForModification={availableSafesForModification}
              safeModificationFilter={safeModificationFilter}
              setSafeModificationFilter={setSafeModificationFilter}
              editingSafeId={editingSafeId}
              setEditingSafeId={setEditingSafeId}
              editedSafeData={editedSafeData}
              setEditedSafeData={setEditedSafeData}
              onSaveModifiedSafe={handleSaveModifiedSafe}
              stagedSafeModifications={stagedSafeModifications}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <QueueSection
              title="Safe Modification Queue"
              items={stagedSafeModifications}
              onRemove={(idx) => setStagedSafeModifications(stagedSafeModifications.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isSafe
            />
          </>
        )}

        {/* Member Modification Tab */}
        {activeTab === 'member-modify' && (
          <>
            <MemberModifySection
              availableMembersForModification={availableMembersForModification}
              memberModificationFilter={memberModificationFilter}
              setMemberModificationFilter={setMemberModificationFilter}
              memberModificationSafeFilter={memberModificationSafeFilter}
              setMemberModificationSafeFilter={setMemberModificationSafeFilter}
              editingMemberId={editingMemberId}
              setEditingMemberId={setEditingMemberId}
              editedMemberData={editedMemberData}
              setEditedMemberData={setEditedMemberData}
              onSaveModifiedMember={handleSaveModifiedMember}
              stagedMemberModifications={stagedMemberModifications}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <QueueSection
              title="Member Modification Queue"
              items={stagedMemberModifications}
              onRemove={(idx) => setStagedMemberModifications(stagedMemberModifications.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isMember
            />
          </>
        )}

        {/* Account Modification Tab */}
        {activeTab === 'account-modify' && (
          <>
            <AccountModifySection
              availableAccountsForModification={availableAccountsForModification}
              accountModificationFilter={accountModificationFilter}
              setAccountModificationFilter={setAccountModificationFilter}
              accountModificationSafeFilter={accountModificationSafeFilter}
              setAccountModificationSafeFilter={setAccountModificationSafeFilter}
              editingAccountId={editingAccountId}
              setEditingAccountId={setEditingAccountId}
              editedAccountData={editedAccountData}
              setEditedAccountData={setEditedAccountData}
              onSaveModifiedAccount={handleSaveModifiedAccount}
              stagedAccountModifications={stagedAccountModifications}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <QueueSection
              title="Account Modification Queue"
              items={stagedAccountModifications}
              onRemove={(idx) => setStagedAccountModifications(stagedAccountModifications.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isAccount
            />
          </>
        )}

        {/* Safe Removal Tab */}
        {activeTab === 'safe-remove' && (
          <>
            <SafeRemovalSection
              availableSafesForRemoval={availableSafesForRemoval}
              selectedSafesForRemoval={selectedSafesForRemoval}
              setSelectedSafesForRemoval={setSelectedSafesForRemoval}
              safeRemovalFilter={safeRemovalFilter}
              setSafeRemovalFilter={setSafeRemovalFilter}
              onStageSafeRemovals={handleStageSafeRemovals}
              stagedSafeRemovals={stagedSafeRemovals}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <QueueSection
              title="Safe Removal Queue"
              items={stagedSafeRemovals}
              onRemove={(idx) => setStagedSafeRemovals(stagedSafeRemovals.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isSafe
              isRemoval
            />
          </>
        )}

        {/* Member Removal Tab */}
        {activeTab === 'member-remove' && (
          <>
            <MemberRemovalSection
              availableMembersForRemoval={availableMembersForRemoval}
              selectedMembersForRemoval={selectedMembersForRemoval}
              setSelectedMembersForRemoval={setSelectedMembersForRemoval}
              memberRemovalFilter={memberRemovalFilter}
              setMemberRemovalFilter={setMemberRemovalFilter}
              memberRemovalSafeFilter={memberRemovalSafeFilter}
              setMemberRemovalSafeFilter={setMemberRemovalSafeFilter}
              onStageMemberRemovals={handleStageMemberRemovals}
              stagedMemberRemovals={stagedMemberRemovals}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <QueueSection
              title="Member Removal Queue"
              items={stagedMemberRemovals}
              onRemove={(idx) => setStagedMemberRemovals(stagedMemberRemovals.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isMember
              isRemoval
            />
          </>
        )}

        {/* Account Removal Tab */}
        {activeTab === 'account-remove' && (
          <>
            <AccountRemovalSection
              availableAccountsForRemoval={availableAccountsForRemoval}
              selectedAccountsForRemoval={selectedAccountsForRemoval}
              setSelectedAccountsForRemoval={setSelectedAccountsForRemoval}
              accountRemovalFilter={accountRemovalFilter}
              setAccountRemovalFilter={setAccountRemovalFilter}
              accountRemovalSafeFilter={accountRemovalSafeFilter}
              setAccountRemovalSafeFilter={setAccountRemovalSafeFilter}
              onStageAccountRemovals={handleStageAccountRemovals}
              stagedAccountRemovals={stagedAccountRemovals}
              isDark={isDark}
              themeClasses={themeClasses}
            />
            <QueueSection
              title="Account Removal Queue"
              items={stagedAccountRemovals}
              onRemove={(idx) => setStagedAccountRemovals(stagedAccountRemovals.filter((_, i) => i !== idx))}
              isDark={isDark}
              themeClasses={themeClasses}
              isAccount
              isRemoval
            />
          </>
        )}

        {/* Review & Deploy Tab */}
        {activeTab === 'review-deploy' && (
          <div className="space-y-8">
            <div className={`p-8 rounded-[1.5rem] border ${themeClasses.card}`} style={themeClasses.cardStyle}>
              <h2 className="text-2xl font-black mb-6" style={{ color: themeClasses.text }}>
                Review & Deploy Staged Items
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                  title="Safes Ready"
                  count={stagedSafes.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
                <StatsCard
                  title="Members Ready"
                  count={stagedMembers.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
                <StatsCard
                  title="Accounts Ready"
                  count={stagedAccounts.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                  title="Safes for Removal"
                  count={stagedSafeRemovals.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
                <StatsCard
                  title="Members for Removal"
                  count={stagedMemberRemovals.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
                <StatsCard
                  title="Accounts for Removal"
                  count={stagedAccountRemovals.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                  title="Safes Modified"
                  count={stagedSafeModifications.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
                <StatsCard
                  title="Members Modified"
                  count={stagedMemberModifications.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
                <StatsCard
                  title="Accounts Modified"
                  count={stagedAccountModifications.length}
                  isDark={isDark}
                  themeClasses={themeClasses}
                />
              </div>

              {/* Total Items Ready */}
              <div className={`p-6 rounded-lg mb-8 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <p className="text-slate-500 text-sm mb-2">Total Items Staged</p>
                <div className="flex gap-8">
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Additions</p>
                    <p className="text-3xl font-black text-emerald-500">
                      {stagedSafes.length + stagedMembers.length + stagedAccounts.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Removals</p>
                    <p className="text-3xl font-black text-red-500">
                      {stagedSafeRemovals.length + stagedMemberRemovals.length + stagedAccountRemovals.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs mb-1">Modifications</p>
                    <p className="text-3xl font-black text-amber-500">
                      {stagedSafeModifications.length + stagedMemberModifications.length + stagedAccountModifications.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Deploy Button */}
              <button
                onClick={async () => {
                  const totalItems = stagedSafes.length + stagedMembers.length + stagedAccounts.length + 
                                    stagedSafeRemovals.length + stagedMemberRemovals.length + stagedAccountRemovals.length +
                                    stagedSafeModifications.length + stagedMemberModifications.length + stagedAccountModifications.length;
                  if (totalItems === 0) {
                    showNotification('No staged items to deploy!', 'warning');
                    return;
                  }
                  
                  try {
                    showNotification(`Starting deployment of ${totalItems} items...`, "info");
                    
                    // Create Safes
                    for (const safe of stagedSafes) {
                      try {
                        showNotification(`Creating Safe: "${safe.name}"...`, "info");
                        await safeAPI.create({
                          name: safe.name,
                          description: safe.description,
                          managingCPM: safe.CPMManaging,
                          numberOfVersionsRetention: safe.retentionMode === 'versions' ? safe.retentionValue : null,
                          numberOfDaysRetention: safe.retentionMode === 'days' ? safe.retentionValue : null
                        });
                        showNotification(`✓ Safe "${safe.name}" created successfully!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to create Safe "${safe.name}": ${error.message}`, "error");
                      }
                    }
                    
                    // Add Members
                    for (const member of stagedMembers) {
                      try {
                        showNotification(`Adding Member "${member.member}" to Safe "${member.safe}"...`, "info");
                        await memberAPI.add(member.safe, member);
                        showNotification(`✓ Member "${member.member}" added to Safe "${member.safe}"!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to add Member "${member.member}": ${error.message}`, "error");
                      }
                    }
                    
                    // Create Accounts
                    for (const account of stagedAccounts) {
                      try {
                        showNotification(`Creating Account: "${account.userName}"@"${account.address}"...`, "info");
                        await accountAPI.create(account);
                        showNotification(`✓ Account "${account.userName}"@"${account.address}" created!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to create Account "${account.userName}": ${error.message}`, "error");
                      }
                    }
                    
                    // Remove Safes
                    for (const safe of stagedSafeRemovals) {
                      try {
                        showNotification(`Deleting Safe: "${safe.name}"...`, "info");
                        await safeAPI.delete(safe.name);
                        showNotification(`✓ Safe "${safe.name}" deleted successfully!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to delete Safe "${safe.name}": ${error.message}`, "error");
                      }
                    }
                    
                    // Remove Members
                    for (const member of stagedMemberRemovals) {
                      try {
                        showNotification(`Removing Member "${member.member}" from Safe "${member.safe}"...`, "info");
                        await memberAPI.remove(member.safe, member.member);
                        showNotification(`✓ Member "${member.member}" removed from Safe "${member.safe}"!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to remove Member "${member.member}": ${error.message}`, "error");
                      }
                    }
                    
                    // Delete Accounts
                    for (const account of stagedAccountRemovals) {
                      try {
                        showNotification(`Deleting Account: "${account.username}"...`, "info");
                        await accountAPI.delete(account.object);
                        showNotification(`✓ Account "${account.username}" deleted!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to delete Account "${account.username}": ${error.message}`, "error");
                      }
                    }
                    
                    // Modify Safes
                    for (const safe of stagedSafeModifications) {
                      try {
                        showNotification(`Updating Safe: "${safe.name}"...`, "info");
                        await safeAPI.update(safe.id, {
                          managingCPM: safe.managingCPM,
                          numberOfVersionsRetention: safe.numberOfVersionsRetention || null,
                          numberOfDaysRetention: safe.numberOfDaysRetention || null
                        });
                        showNotification(`✓ Safe "${safe.name}" updated successfully!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to update Safe "${safe.name}": ${error.message}`, "error");
                      }
                    }
                    
                    // Modify Members
                    for (const member of stagedMemberModifications) {
                      try {
                        showNotification(`Updating Member: "${member.member}"...`, "info");
                        await memberAPI.updatePermissions(member.safe, member.member, member.perms || {});
                        showNotification(`✓ Member "${member.member}" permissions updated!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to update Member "${member.member}": ${error.message}`, "error");
                      }
                    }
                    
                    // Modify Accounts
                    for (const account of stagedAccountModifications) {
                      try {
                        showNotification(`Updating Account: "${account.userName}"...`, "info");
                        await accountAPI.update(account.id, {
                          address: account.address,
                          secret: account.secret,
                          userName: account.userName,
                          automaticManagement: account.automaticManagement,
                          manualManagementReason: account.manualManagementReason
                        });
                        showNotification(`✓ Account "${account.userName}" updated successfully!`, "success");
                      } catch (error) {
                        showNotification(`✗ Failed to update Account "${account.userName}": ${error.message}`, "error");
                      }
                    }
                    
                    showNotification(`✓ Deployment completed! ${totalItems} items processed.`, "success");
                    
                    // Clear staged items after successful deployment
                    setStagedSafes([]);
                    setStagedMembers([]);
                    setStagedAccounts([]);
                    setStagedSafeRemovals([]);
                    setStagedMemberRemovals([]);
                    setStagedAccountRemovals([]);
                    setStagedSafeModifications([]);
                    setStagedMemberModifications([]);
                    setStagedAccountModifications([]);
                  } catch (error) {
                    showNotification(`Deployment error: ${error.message}`, "error");
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-xl shadow-lg uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={(stagedSafes.length + stagedMembers.length + stagedAccounts.length + stagedSafeRemovals.length + stagedMemberRemovals.length + stagedAccountRemovals.length + stagedSafeModifications.length + stagedMemberModifications.length + stagedAccountModifications.length) === 0}
              >
                <Send size={20} /> Deploy All Staged Changes
              </button>
            </div>

            {/* Detailed Review Section */}
            {(stagedSafes.length > 0 || stagedMembers.length > 0 || stagedAccounts.length > 0 || 
              stagedSafeRemovals.length > 0 || stagedMemberRemovals.length > 0 || stagedAccountRemovals.length > 0) && (
              <div className={`p-8 rounded-[1.5rem] border ${themeClasses.card}`}>
                <h3 className="text-xl font-bold mb-6" style={{ color: themeClasses.text }}>
                  Detailed Staged Items
                </h3>

                {/* ADDITIONS SECTION */}
                {(stagedSafes.length > 0 || stagedMembers.length > 0 || stagedAccounts.length > 0) && (
                  <div className="mb-8">
                    <h4 className="text-lg font-bold mb-4 text-emerald-500 flex items-center gap-2"><UserRoundPlus size={20} /> Added Items</h4>
                    
                    {stagedSafes.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-bold text-sm mb-3 text-blue-500">Safes ({stagedSafes.length})</h5>
                        <div className="space-y-3">
                          {stagedSafes.map((safe, idx) => (
                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <p className="font-semibold">{safe.name}</p>
                              {safe.description && (
                                <p className="text-[9px] text-slate-500 mt-2 italic">
                                  {safe.description}
                                </p>
                              )}
                              <div className="flex gap-3 mt-2 flex-wrap">
                                <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                                  CPM: {safe.CPMManaging || 'Not specified'}
                                </span>
                                <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                                  Retention: {safe.retentionMode === 'versions' ? `${safe.retentionValue} versions` : `${safe.retentionValue} days`}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stagedMembers.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-bold text-sm mb-3 text-blue-500">Members ({stagedMembers.length})</h5>
                        <div className="space-y-3">
                          {stagedMembers.map((member, idx) => (
                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <p className="font-semibold">{member.member}<span className="text-slate-500 font-normal"> @ {member.domain}</span></p>
                              <div className="flex gap-3 mt-2 flex-wrap">
                                <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                                  Role: {member.roleLabel}
                                </span>
                                <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                                  Safe: {member.safe}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stagedAccounts.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-bold text-sm mb-3 text-blue-500">Accounts ({stagedAccounts.length})</h5>
                        <div className="space-y-3">
                          {stagedAccounts.map((account, idx) => (
                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <p className="font-mono font-bold" style={{ color: themeClasses.text }}>
                                {account.userName} <span className="text-red-600">@</span> {account.address}
                              </p>
                              <div className="flex gap-3 mt-2 flex-wrap">
                                <span className="text-[9px] bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <Layers2 size={10} /> Platform: {account.platformId}
                                </span>
                                <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <Vault size={10} /> Safe: {account.safeName}
                                </span>
                                <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                                  Object-ID: {account.object}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* REMOVALS SECTION */}
                {(stagedSafeRemovals.length > 0 || stagedMemberRemovals.length > 0 || stagedAccountRemovals.length > 0) && (
                  <div className="mb-8 border-t pt-8">
                    <h4 className="text-lg font-bold mb-4 text-red-500 flex items-center gap-2"><UserRoundMinus size={20} /> Removed Items</h4>
                    
                    {stagedSafeRemovals.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-bold text-sm mb-3 text-blue-500">Safes ({stagedSafeRemovals.length})</h5>
                        <div className="space-y-3">
                          {stagedSafeRemovals.map((safe, idx) => (
                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <p className="font-semibold">{safe.name}</p>
                              <div className="flex gap-3 mt-2 flex-wrap">
                                <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                                  CPM: {safe.managingCPM}
                                </span>
                                <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                                  Retention: {safe.numberOfVersionsRetention ? `${safe.numberOfVersionsRetention} versions` : safe.numberOfDaysRetention ? `${safe.numberOfDaysRetention} days` : 'Not specified'}
                                </span>
                                <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                                  ID: {safe.id}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stagedMemberRemovals.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-bold text-sm mb-3 text-blue-500">Members ({stagedMemberRemovals.length})</h5>
                        <div className="space-y-3">
                          {stagedMemberRemovals.map((member, idx) => (
                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <p className="font-semibold">{member.member}<span className="text-slate-500 font-normal"> @ {member.domain}</span></p>
                              <div className="flex gap-3 mt-2 flex-wrap">
                                <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                                  Role: {member.role}
                                </span>
                                <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                                  Safe: {member.safe}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {stagedAccountRemovals.length > 0 && (
                      <div className="mb-6">
                        <h5 className="font-bold text-sm mb-3 text-blue-500">Accounts ({stagedAccountRemovals.length})</h5>
                        <div className="space-y-3">
                          {stagedAccountRemovals.map((account, idx) => (
                            <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                              <p className="font-mono font-bold" style={{ color: themeClasses.text }}>
                                {account.username} <span className="text-red-600">@</span> {account.address}
                              </p>
                              <div className="flex gap-3 mt-2 flex-wrap">
                                <span className="text-[9px] bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <Layers2 size={10} /> Platform: {account.platform}
                                </span>
                                <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                                  <Vault size={10} /> Safe: {account.safeName}
                                </span>
                                <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                                  Object-ID: {account.object}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const StatsCard = ({ title, count, isDark, isStatus, themeClasses }) => (
  <div className={`p-8 rounded-[1.5rem] border ${themeClasses.card}`}>
    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">
      {title}
    </p>
    <p
      className={`text-3xl font-black ${isStatus ? 'text-emerald-500' : ''}`}
      style={!isStatus ? { color: themeClasses.text } : {}}
    >
      {count}
    </p>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, isDark, themeClasses }) => (
  <div className="mb-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${themeClasses?.input || (isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200')}`}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, isDark, themeClasses }) => (
  <div className="mb-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-3 rounded-xl border text-sm outline-none ${themeClasses?.input || (isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200')}`}
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  </div>
);

const SafeManagementSection = ({
  customSafeName, setCustomSafeName, safeDescription, setSafeDescription, managingCPM, setManagingCPM,
  retentionMode, setRetentionMode, versionRetention, setVersionRetention, daysRetention, setDaysRetention,
  onAddSafe, isDark, themeClasses
}) => {
  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase mb-8">
        Safe Creation Management
      </h2>
      
      {/* Safe Name & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Safe Name */}
        <div className={`p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            Safe Name
          </label>
          <input
            type="text"
            value={customSafeName}
            onChange={(e) => setCustomSafeName(e.target.value)}
            placeholder="Enter Safe name"
            className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
            onKeyPress={(e) => e.key === 'Enter' && onAddSafe()}
          />
        </div>

        {/* Description */}
        <div className={`p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            Description (optional)
          </label>
          <textarea
            value={safeDescription}
            onChange={(e) => setSafeDescription(e.target.value)}
            placeholder="Enter a description for this Safe"
            className={`w-full p-3 rounded-xl border text-sm outline-none transition-all resize-none ${themeClasses.input}`}
            rows="3"
          />
        </div>
      </div>

      {/* CPM & Retention Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* CPM Management */}
        <div className={`p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            Managing CPM
          </label>
          <input
            type="text"
            value={managingCPM}
            onChange={(e) => setManagingCPM(e.target.value)}
            placeholder="e.g. PasswordManager"
            className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          />
        </div>

        {/* Retention Type & Retention Value Input */}
        <div className={`p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`}>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">
            Retention Type
          </label>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRetentionMode('versions')}
              className={`flex-1 px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${
                retentionMode === 'versions'
                  ? 'bg-red-600 text-white shadow-md'
                  : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white border text-slate-600 hover:bg-slate-100'
              }`}
            >
              Versions
            </button>
            <button
              onClick={() => setRetentionMode('days')}
              className={`flex-1 px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${
                retentionMode === 'days'
                  ? 'bg-red-600 text-white shadow-md'
                  : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white border text-slate-600 hover:bg-slate-100'
              }`}
            >
              Days
            </button>
          </div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            {retentionMode === 'versions' ? 'Number of Versions' : 'Number of Days'}
          </label>
          <input
            type="number"
            min="1"
            value={retentionMode === 'versions' ? versionRetention : daysRetention}
            onChange={(e) => retentionMode === 'versions' ? setVersionRetention(e.target.value) : setDaysRetention(e.target.value)}
            placeholder={`Enter number of ${retentionMode === 'versions' ? 'versions' : 'days'} to be retained`}
            className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          />
        </div>
      </div>

      <button
        onClick={onAddSafe}
        disabled={!customSafeName.trim() || !((retentionMode === 'versions' ? versionRetention : daysRetention))}
        className={`w-full font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
          customSafeName.trim() && (retentionMode === 'versions' ? versionRetention : daysRetention)
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
        }`}
      >
        <PlusCircle size={20} /> Stage Safe
      </button>
    </div>
  );
};

const MemberManagementSection = ({
  targetSafe, setTargetSafe, memberName, setMemberName, memberDomain, setMemberDomain,
  memberPermissions, setMemberPermissions, onAddStandardMembers, onAddCustomMember,
  isDark, themeClasses, standardMembersSelection, setStandardMembersSelection, editingStandardMember, setEditingStandardMember,
  standardMembersPermissions, setStandardMembersPermissions, managedStandardMembers, setManagedStandardMembers, 
  editingMemberInModal, setEditingMemberInModal, newMemberForm, setNewMemberForm
}) => {
  const boxStyle = `p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`;

  const toggleStandardMember = (memberName) => {
    setStandardMembersSelection({
      ...standardMembersSelection,
      [memberName]: !standardMembersSelection[memberName]
    });
    if (!standardMembersPermissions[memberName]) {
      const member = managedStandardMembers.find(m => m.member === memberName);
      setStandardMembersPermissions({
        ...standardMembersPermissions,
        [memberName]: { ...member.perms }
      });
    }
  };

  const updateStandardMemberPerm = (memberName, perm, value) => {
    setStandardMembersPermissions({
      ...standardMembersPermissions,
      [memberName]: {
        ...standardMembersPermissions[memberName],
        [perm]: value
      }
    });
  };

  const addNewStandardMember = () => {
    if (!newMemberForm.member.trim()) return showNotification("Please enter a member name!", "error");
    const newMember = {
      member: newMemberForm.member,
      domain: newMemberForm.domain,
      perms: newMemberForm.perms || PERM_TEMPLATES.PAM,
      role: detectRoleFromPermissions(newMemberForm.perms || PERM_TEMPLATES.PAM)
    };
    setManagedStandardMembers([...managedStandardMembers, newMember]);
    setNewMemberForm({ member: '', domain: 'Vault', role: '', perms: {} });
  };

  const removeStandardMember = (memberName) => {
    setManagedStandardMembers(managedStandardMembers.filter(m => m.member !== memberName));
    setStandardMembersSelection(prev => {
      const updated = { ...prev };
      delete updated[memberName];
      return updated;
    });
    setStandardMembersPermissions(prev => {
      const updated = { ...prev };
      delete updated[memberName];
      return updated;
    });
  };

  const updateManagedMember = (memberName, updates) => {
    setManagedStandardMembers(managedStandardMembers.map(m => 
      m.member === memberName ? { ...m, ...updates } : m
    ));
  };

  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <div className="flex justify-between items-center mb-8">
        <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase">
          Member Creation Management
        </h2>
        <button
          onClick={() => setEditingStandardMember(editingStandardMember ? null : 'editor')}
          className="bg-blue-600 text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
        >
          {editingStandardMember ? 'Close Editor' : 'Edit Standard Members'}
        </button>
      </div>

      {/* Standard Members Modal/Editor */}
      {editingStandardMember === 'editor' && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/70' : 'bg-black/50'}`}>
          <div className={`rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto ${themeClasses.card} border p-8`}>
            <div className="flex justify-between items-center mb-6">
              <h3 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase">
                Manage Standard Members
              </h3>
              <button
                onClick={() => setEditingStandardMember(null)}
                className="text-2xl text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Add New Member Form */}
            <div className={`mb-6 p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-300'}`}>
              <h4 style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-3">Add New Standard Member</h4>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newMemberForm.member}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, member: e.target.value })}
                  placeholder="Member name (e.g., G_NEW_GROUP)"
                  className={`flex-1 p-2 rounded-lg text-sm outline-none border ${themeClasses.input}`}
                />
                <select
                  value={newMemberForm.domain}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, domain: e.target.value })}
                  className={`flex-1 p-2 rounded-lg text-sm outline-none border ${themeClasses.input}`}
                >
                  <option value="Vault">Vault</option>
                  <option value="Domain.example">Domain.example</option>
                </select>
                <select
                  value={detectRoleFromPermissions(newMemberForm.perms || {})}
                  onChange={(e) => {
                    const role = e.target.value;
                    setNewMemberForm({ 
                      ...newMemberForm, 
                      perms: PERM_TEMPLATES[role] || {},
                      role 
                    });
                  }}
                  className={`flex-1 p-2 rounded-lg text-sm outline-none border ${themeClasses.input}`}
                >
                  <option value="">Select Template</option>
                  {Object.keys(PERM_TEMPLATES).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <button
                  onClick={addNewStandardMember}
                  className="bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Existing Members List */}
            <div className="space-y-3 mb-6">
              {managedStandardMembers.map((member) => (
                <div key={member.member} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={standardMembersSelection[member.member] || false}
                          onChange={() => toggleStandardMember(member.member)}
                          className="accent-red-600 w-4 h-4"
                        />
                        <div>
                          <div className="font-bold text-sm" style={{ color: themeClasses.text }}>
                            {member.member}
                            <span className="text-slate-500 font-normal"> @ {member.domain}</span>
                          </div>
                          <div className="text-[9px] text-slate-500 mt-1">Role: {member.role}</div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStandardMember(member.member)}
                      className="text-red-600 hover:text-red-700 font-bold text-sm"
                    >
                      ✕ Remove
                    </button>
                  </div>

                  {/* Permissions Grid */}
                  {standardMembersSelection[member.member] && (
                    <div className={`grid grid-cols-4 gap-3 p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-white border border-slate-200'}`}>
                      {PERMISSION_KEYS.map((perm) => (
                        <label key={perm} className="flex items-center gap-2 text-[9px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={standardMembersPermissions[member.member]?.[perm] || false}
                            onChange={(e) => {
                              updateStandardMemberPerm(member.member, perm, e.target.checked);
                              const updatedPerms = { ...standardMembersPermissions[member.member], [perm]: e.target.checked };
                              updateManagedMember(member.member, { perms: updatedPerms, role: detectRoleFromPermissions(updatedPerms) });
                            }}
                            className="accent-red-600"
                          />
                          <span className="truncate opacity-70" style={{ color: themeClasses.text }}>
                            {perm}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingStandardMember(null)}
                className="flex-1 bg-slate-400 text-white font-black py-3 rounded-xl uppercase tracking-widest hover:bg-slate-500 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setEditingStandardMember(null)}
                className="flex-1 bg-emerald-600 text-white font-black py-3 rounded-xl uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg"
              >
                Done Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standard Members Summary */}
      {Object.values(standardMembersSelection).some(v => v) && (
        <div className={`mb-8 p-6 rounded-2xl border ${isDark ? 'bg-emerald-900/20 border-emerald-700' : 'bg-emerald-50 border-emerald-300'}`}>
          <h3 style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-3">
            Selected Standard Members
          </h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {managedStandardMembers.filter(m => standardMembersSelection[m.member]).map(member => (
              <span key={member.member} className="text-[9px] font-bold px-3 py-1 rounded-full bg-emerald-600 text-white">
                {member.member}
              </span>
            ))}
          </div>
          <button
            onClick={onAddStandardMembers}
            disabled={!targetSafe}
            className="w-full bg-emerald-600 text-white text-sm font-black px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Selected Standard Members
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {/* Target Safe & Templates */}
        <div className={boxStyle}>
          <InputField
            label="Target Safe"
            value={targetSafe}
            onChange={setTargetSafe}
            placeholder="0000-ABCD-MSP-Example"
            isDark={isDark}
            themeClasses={themeClasses}
          />
          <div className="mt-4">
            <label className="text-[10px] font-black text-slate-500 uppercase block mb-2">
              Permission Templates
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(PERM_TEMPLATES).map((t) => (
                <button
                  key={t}
                  onClick={() => setMemberPermissions(PERM_TEMPLATES[t])}
                  className={`text-[9px] font-bold py-2 border rounded-lg transition-all hover:bg-red-600 hover:text-white ${
                    isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-600'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Member Details & Permissions */}
        <div className={`${boxStyle} md:col-span-2`}>
          <div className="mb-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
              Member
            </label>
            <div className="flex gap-2">
              <div className="flex-[3]">
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="User/Group Name"
                  className={`w-full p-3 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
                />
              </div>
              <div className="flex-[2]">
                <select
                  value={memberDomain}
                  onChange={(e) => setMemberDomain(e.target.value)}
                  className={`w-full p-3 rounded-xl border text-sm outline-none ${themeClasses.input}`}
                >
                  <option value="Vault">Vault</option>
                  <option value="Domain.example">Domain.example</option>
                </select>
              </div>
            </div>
          </div>
          <div className={`grid grid-cols-4 gap-x-4 gap-y-0 h-31 overflow-y-auto pr-2 custom-scrollbar ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
            {PERMISSION_KEYS.map((perm) => (
              <div
                key={perm}
                className={`flex items-center justify-between text-[9px] border-b py-1 ${
                  isDark ? 'border-slate-700' : 'border-slate-300'
                }`}
              >
                <span
                  className="truncate opacity-80"
                  style={{ color: themeClasses.text }}
                >
                  {perm}
                </span>
                <input
                  type="checkbox"
                  checked={memberPermissions[perm] || false}
                  onChange={(e) =>
                    setMemberPermissions({
                      ...memberPermissions,
                      [perm]: e.target.checked
                    })
                  }
                  className="accent-red-600"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onAddCustomMember}
        disabled={!targetSafe || !memberName}
        className={`w-full font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
          targetSafe && memberName
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
        }`}
      >
        <PlusCircle size={20} /> Stage Member
      </button>
    </div>
  );
};

const AccountManagementSection = ({
  accObject, setAccObject, accAddress, setAccAddress, accUsername, setAccUsername,
  accPassword, setAccPassword, accPlatformId, setAccPlatformId, accSafeName, setAccSafeName,
  accAutoMgmt, setAccAutoMgmt, accManualReason, setAccManualReason, accRemoteMachines,
  setAccRemoteMachines, onAddAccount, isDark, themeClasses
}) => {
  const boxStyle = `p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-300'}`;

  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase mb-8">
        Account Creation Management
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Object & Credentials */}
        <div className={boxStyle}>
          <InputField label="Object ID" value={accObject} onChange={setAccObject} isDark={isDark} themeClasses={themeClasses} />
          <InputField label="Username" value={accUsername} onChange={setAccUsername} isDark={isDark} themeClasses={themeClasses} />
          <InputField label="Secret" value={accPassword} onChange={setAccPassword} isDark={isDark} placeholder="optional" themeClasses={themeClasses} />
        </div>

        {/* Address & Platform */}
        <div className={boxStyle}>
          <InputField label="Address" value={accAddress} onChange={setAccAddress} isDark={isDark} themeClasses={themeClasses} />
          <InputField label="Platform ID" value={accPlatformId} onChange={setAccPlatformId} isDark={isDark} themeClasses={themeClasses} />
          <InputField label="Safe Name" value={accSafeName} onChange={setAccSafeName} isDark={isDark} themeClasses={themeClasses} />
        </div>

        {/* CPM Management */}
        <div className={boxStyle}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase">
              CPM Management
            </span>
            <input
              type="checkbox"
              checked={accAutoMgmt}
              onChange={(e) => setAccAutoMgmt(e.target.checked)}
              className="accent-red-600 w-5 h-5 rounded-lg"
            />
          </div>
          {!accAutoMgmt && (
            <div className="space-y-3 w-full mb-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">
                Manual Reason
              </label>
              <textarea
                value={accManualReason}
                onChange={(e) => setAccManualReason(e.target.value)}
                className={`w-full h-20 p-3 text-xs rounded-xl border outline-none ${themeClasses.input}`}
                placeholder="Why is CPM disabled?"
              />
            </div>
          )}
          <InputField
            label="Allowed Machines"
            value={accRemoteMachines}
            onChange={setAccRemoteMachines}
            isDark={isDark}
            placeholder="optional"
            themeClasses={themeClasses}
          />
        </div>
      </div>
      <button
        onClick={onAddAccount}
        disabled={!accObject || !accAddress || !accUsername || !accPlatformId || !accSafeName}
        className={`w-full font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
          accObject && accAddress && accUsername && accPlatformId && accSafeName
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
        }`}
      >
        <PlusCircle size={20} /> Stage Account
      </button>
    </div>
  );
};

const QueueSection = ({ title, items, onRemove, isDark, themeClasses, isMember, isAccount, isSafe, isRemoval }) => (
  <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
    <div className="flex justify-between items-center mb-8">
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase">
        {title}
      </h2>
      <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full">
        {items.length}
      </span>
    </div>
    {items.length > 0 ? (
      <div className="space-y-4">
        {items.map((item, i) => (
          <div
            key={i}
            className={`group p-6 rounded-2xl border flex justify-between items-start transition-all ${
              isDark
                ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
                : 'bg-slate-50 border-slate-200 hover:bg-white hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4 overflow-hidden flex-1">
              <div className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-slate-700' : 'bg-white border'}`}>
                {isSafe ? (
                  <Lock size={16} className="text-red-600" />
                ) : isMember ? (
                  <Users size={16} className="text-red-600" />
                ) : isAccount ? (
                  <Database size={16} className="text-red-600" />
                ) : (
                  <Lock size={16} className="text-red-600" />
                )}
              </div>
              <div className="truncate flex-1">
                {isSafe ? (
                  <div className="flex flex-col gap-2">
                    <div>
                      <span
                        className="font-mono text-sm font-black"
                        style={{ color: themeClasses.text }}
                      >
                        {item.name}
                      </span>
                      {item.description && (
                        <p className="text-[9px] text-slate-500 mt-1 italic">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isRemoval ? (
                        <>
                          <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                            CPM: {item.managingCPM}
                          </span>
                          <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                            Retention: {item.numberOfVersionsRetention ? `${item.numberOfVersionsRetention} versions` : item.numberOfDaysRetention ? `${item.numberOfDaysRetention} days` : 'Not specified'}
                          </span>
                          <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                            ID: {item.id}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                            CPM: {item.CPMManaging}
                          </span>
                          <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                            Retention: {item.retentionMode === 'versions' ? `${item.retentionValue} versions` : `${item.retentionValue} days`}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ) : isMember ? (
                  <div className="flex flex-col">
                    <span
                      className="font-mono text-xs font-black"
                      style={{ color: themeClasses.text }}
                    >
                      {item.member}
                      <span className="text-slate-500 font-normal">
                        {' '}@ {item.domain}
                      </span>
                    </span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold uppercase">
                        Role: {item.role}
                      </span>
                      <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold uppercase">
                        Safe: {item.safe}
                      </span>
                    </div>
                  </div>
                ) : isAccount ? (
                  <div className="flex flex-col gap-2">
                    <span
                      className="font-mono text-sm font-black"
                      style={{ color: themeClasses.text }}
                    >
                      {item.userName || item.username}
                      <span className="text-red-600">{' '}@{' '}</span>
                      {item.address}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[9px] bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Layers2 size={10} /> Platform: {item.platformId || item.platform}
                      </span>
                      <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Vault size={10} /> Safe: {item.safeName}
                      </span>
                      <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                        Object-ID: {item.object}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span
                      className="font-mono text-xs font-black uppercase tracking-tight"
                      style={{ color: themeClasses.text }}
                    >
                      {item}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemove(i)}
              className="p-2 rounded-lg text-slate-400 hover:bg-red-600 hover:text-white transition-all flex-shrink-0"
              aria-label="Remove item"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <div className="flex justify-end pt-6">
          <button className="bg-red-600 text-white font-black py-4 px-10 rounded-xl uppercase text-xs tracking-widest flex items-center gap-2 shadow-xl hover:bg-red-700 transition-all">
            <Send size={16} /> Execute Deployment
          </button>
        </div>
      </div>
    ) : (
      <div className="py-10 text-center text-slate-400 italic text-xs">
        Queue is empty.
      </div>
    )}
  </div>
);

// ============================================================================
// SAFE MODIFICATION SECTION
// ============================================================================

const SafeModifySection = ({
  availableSafesForModification, safeModificationFilter, setSafeModificationFilter,
  editingSafeId, setEditingSafeId, editedSafeData, setEditedSafeData,
  onSaveModifiedSafe, stagedSafeModifications, isDark, themeClasses
}) => {
  const filteredSafes = availableSafesForModification.filter(safe =>
    safe.name.toLowerCase().includes(safeModificationFilter.toLowerCase()) ||
    safe.id.toLowerCase().includes(safeModificationFilter.toLowerCase())
  );

  const stagedSafeIds = stagedSafeModifications.map(s => s.id);

  const getRetentionDisplay = (safe) => {
    if (safe.numberOfVersionsRetention) {
      return `${safe.numberOfVersionsRetention} versions`;
    }
    if (safe.numberOfDaysRetention) {
      return `${safe.numberOfDaysRetention} days`;
    }
    return 'Not specified';
  };

  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase mb-8">
        Safe Modification Management
      </h2>

      {/* Filter */}
      <div className="mb-8">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
          Filter Safes
        </label>
        <input
          type="text"
          value={safeModificationFilter}
          onChange={(e) => setSafeModificationFilter(e.target.value)}
          placeholder="Search by Safe name or ID..."
          className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
        />
      </div>

      {/* Available Safes List */}
      <div className="mb-8">
        <h3 style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-4">
          Available Safes ({filteredSafes.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSafes.length > 0 ? (
            filteredSafes.map((safe) => {
              const isEditing = editingSafeId === safe.id;
              const isStagged = stagedSafeIds.includes(safe.id);
              const currentData = isEditing ? { ...safe, ...editedSafeData } : safe;

              return (
                <div
                  key={safe.id}
                  className={`p-4 rounded-lg border transition-all ${isStagged ? 'opacity-60' : ''} ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Managing CPM */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Managing CPM</label>
                        <input
                          type="text"
                          value={editedSafeData.managingCPM || safe.managingCPM || ''}
                          onChange={(e) => setEditedSafeData({ ...editedSafeData, managingCPM: e.target.value })}
                          className={`w-full p-2 rounded-lg border text-sm outline-none ${themeClasses.input}`}
                        />
                      </div>

                      {/* Retention Type & Value */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Retention Type</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditedSafeData({ ...editedSafeData, retentionType: 'versions' })}
                              className={`flex-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                                (editedSafeData.retentionType || (safe.numberOfVersionsRetention ? 'versions' : 'days')) === 'versions'
                                  ? 'bg-red-600 text-white shadow-md'
                                  : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white border text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Versions
                            </button>
                            <button
                              onClick={() => setEditedSafeData({ ...editedSafeData, retentionType: 'days' })}
                              className={`flex-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase transition-all ${
                                (editedSafeData.retentionType || (safe.numberOfVersionsRetention ? 'versions' : 'days')) === 'days'
                                  ? 'bg-red-600 text-white shadow-md'
                                  : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white border text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              Days
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">
                            {(editedSafeData.retentionType || (safe.numberOfVersionsRetention ? 'versions' : 'days')) === 'versions' ? 'Number of Versions' : 'Number of Days'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={
                              editedSafeData.retentionType === 'versions' || (!editedSafeData.retentionType && safe.numberOfVersionsRetention)
                                ? (editedSafeData.retentionValue || safe.numberOfVersionsRetention || '')
                                : (editedSafeData.retentionValue || safe.numberOfDaysRetention || '')
                            }
                            onChange={(e) => setEditedSafeData({ ...editedSafeData, retentionValue: e.target.value })}
                            className={`w-full p-2 rounded-lg border text-sm outline-none ${themeClasses.input}`}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onSaveModifiedSafe(safe.id)}
                          className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingSafeId(null);
                            setEditedSafeData({});
                          }}
                          className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold" style={{ color: themeClasses.text }}>
                          {safe.name}
                        </p>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                            CPM: {safe.managingCPM}
                          </span>
                          <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                            Retention: {getRetentionDisplay(safe)}
                          </span>
                          <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                            ID: {safe.id}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingSafeId(safe.id);
                          setEditedSafeData({
                            retentionType: safe.numberOfVersionsRetention ? 'versions' : 'days',
                            retentionValue: safe.numberOfVersionsRetention || safe.numberOfDaysRetention
                          });
                        }}
                        disabled={isStagged}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ml-4 ${
                          isStagged
                            ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 italic text-sm">No Safes found</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MEMBER MODIFICATION SECTION
// ============================================================================

const MemberModifySection = ({
  availableMembersForModification, memberModificationFilter, setMemberModificationFilter,
  memberModificationSafeFilter, setMemberModificationSafeFilter,
  editingMemberId, setEditingMemberId, editedMemberData, setEditedMemberData,
  onSaveModifiedMember, stagedMemberModifications, isDark, themeClasses
}) => {
  const filteredMembers = availableMembersForModification.filter(member => {
    const nameMatch = member.member.toLowerCase().includes(memberModificationFilter.toLowerCase());
    const safeMatch = !memberModificationSafeFilter || member.safe === memberModificationSafeFilter;
    return nameMatch && safeMatch;
  });

  const stagedMemberIds = stagedMemberModifications.map(m => m.id);

  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase mb-8">
        Member Modification Management
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            Filter Members
          </label>
          <input
            type="text"
            value={memberModificationFilter}
            onChange={(e) => setMemberModificationFilter(e.target.value)}
            placeholder="Search by member name..."
            className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            Filter by Safe
          </label>
          <input
            type="text"
            value={memberModificationSafeFilter}
            onChange={(e) => setMemberModificationSafeFilter(e.target.value)}
            placeholder="Safe name..."
            className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          />
        </div>
      </div>

      {/* Available Members List */}
      <div className="mb-8">
        <h3 style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-4">
          Available Members ({filteredMembers.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => {
              const isEditing = editingMemberId === member.id;
              const isStagged = stagedMemberIds.includes(member.id);
              const currentPerms = isEditing && editedMemberData.perms ? editedMemberData.perms : (member.perms || {});

              return (
                <div
                  key={member.id}
                  className={`p-4 rounded-lg border transition-all ${isStagged ? 'opacity-60' : ''} ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* Permission Templates */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Permission Presets</label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.keys(PERM_TEMPLATES).map((t) => (
                            <button
                              key={t}
                              onClick={() =>
                                setEditedMemberData({
                                  ...editedMemberData,
                                  perms: PERM_TEMPLATES[t]
                                })
                              }
                              className={`text-[9px] font-bold py-2 border rounded-lg transition-all hover:bg-red-600 hover:text-white ${
                                isDark ? 'border-slate-700 text-slate-400' : 'border-slate-300 text-slate-600'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Individual Rights Grid */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase block mb-2">Individual Rights</label>
                        <div className={`grid grid-cols-4 gap-x-4 gap-y-0 max-h-48 overflow-y-auto pr-2 custom-scrollbar border rounded-lg p-3 ${isDark ? 'border-slate-700' : 'border-slate-300'}`}>
                          {PERMISSION_KEYS.map((perm) => (
                            <div
                              key={perm}
                              className={`flex items-center justify-between text-[9px] border-b py-1 ${
                                isDark ? 'border-slate-700' : 'border-slate-300'
                              }`}
                            >
                              <span
                                className="truncate opacity-80"
                                style={{ color: themeClasses.text }}
                              >
                                {perm}
                              </span>
                              <input
                                type="checkbox"
                                checked={currentPerms[perm] || false}
                                onChange={(e) =>
                                  setEditedMemberData({
                                    ...editedMemberData,
                                    perms: {
                                      ...currentPerms,
                                      [perm]: e.target.checked
                                    }
                                  })
                                }
                                className="accent-red-600"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => onSaveModifiedMember(member.id)}
                          className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingMemberId(null);
                            setEditedMemberData({});
                          }}
                          className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold" style={{ color: themeClasses.text }}>
                          {member.member}<span className="text-slate-500 font-normal"> @ {member.domain}</span>
                        </p>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                            Role: {member.role}
                          </span>
                          <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                            Safe: {member.safe}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEditingMemberId(member.id);
                          setEditedMemberData({ perms: member.perms || {} });
                        }}
                        disabled={isStagged}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ml-4 ${
                          isStagged
                            ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 italic text-sm">No Members found</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ACCOUNT MODIFICATION SECTION
// ============================================================================

const AccountModifySection = ({
  availableAccountsForModification, accountModificationFilter, setAccountModificationFilter,
  accountModificationSafeFilter, setAccountModificationSafeFilter,
  editingAccountId, setEditingAccountId, editedAccountData, setEditedAccountData,
  onSaveModifiedAccount, stagedAccountModifications, isDark, themeClasses
}) => {
  const filteredAccounts = availableAccountsForModification.filter(account => {
    const nameMatch = account.username.toLowerCase().includes(accountModificationFilter.toLowerCase());
    const safeMatch = !accountModificationSafeFilter || account.safeName === accountModificationSafeFilter;
    return nameMatch && safeMatch;
  });

  const stagedAccountIds = stagedAccountModifications.map(a => a.id);

  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase mb-8">
        Account Modification Management
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            Filter Accounts
          </label>
          <input
            type="text"
            value={accountModificationFilter}
            onChange={(e) => setAccountModificationFilter(e.target.value)}
            placeholder="Search by username..."
            className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
            Filter by Safe
          </label>
          <input
            type="text"
            value={accountModificationSafeFilter}
            onChange={(e) => setAccountModificationSafeFilter(e.target.value)}
            placeholder="Safe name..."
            className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          />
        </div>
      </div>

      {/* Available Accounts List */}
      <div className="mb-8">
        <h3 style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-4">
          Available Accounts ({filteredAccounts.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => {
              const isEditing = editingAccountId === account.id;
              const isStagged = stagedAccountIds.includes(account.id);
              const currentData = isEditing ? { ...account, ...editedAccountData } : account;

              return (
                <div
                  key={account.id}
                  className={`p-4 rounded-lg border transition-all ${isStagged ? 'opacity-60' : ''} ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Username</label>
                          <input
                            type="text"
                            value={editedAccountData.username !== undefined ? editedAccountData.username : account.username}
                            onChange={(e) => setEditedAccountData({ ...editedAccountData, username: e.target.value })}
                            className={`w-full p-2 rounded-lg border text-sm outline-none ${themeClasses.input}`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Address</label>
                          <input
                            type="text"
                            value={editedAccountData.address !== undefined ? editedAccountData.address : account.address}
                            onChange={(e) => setEditedAccountData({ ...editedAccountData, address: e.target.value })}
                            className={`w-full p-2 rounded-lg border text-sm outline-none ${themeClasses.input}`}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Platform</label>
                          <input
                            type="text"
                            value={editedAccountData.platform !== undefined ? editedAccountData.platform : account.platform}
                            onChange={(e) => setEditedAccountData({ ...editedAccountData, platform: e.target.value })}
                            className={`w-full p-2 rounded-lg border text-sm outline-none ${themeClasses.input}`}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onSaveModifiedAccount(account.id)}
                          className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => {
                            setEditingAccountId(null);
                            setEditedAccountData({});
                          }}
                          className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold rounded-lg transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-mono font-bold" style={{ color: themeClasses.text }}>
                          {account.username} <span className="text-red-600">@</span> {account.address}
                        </p>
                        <div className="flex gap-3 mt-2 flex-wrap">
                          <span className="text-[9px] bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Layers2 size={10} /> Platform: {account.platform}
                          </span>
                          <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                            <Vault size={10} /> Safe: {account.safeName}
                          </span>
                          <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                            Object-ID: {account.object}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setEditingAccountId(account.id)}
                        disabled={isStagged}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex-shrink-0 ml-4 ${
                          isStagged
                            ? 'bg-slate-400 text-slate-600 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 italic text-sm">No Accounts found</p>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SAFE REMOVAL SECTION
// ============================================================================

const SafeRemovalSection = ({
  availableSafesForRemoval, selectedSafesForRemoval, setSelectedSafesForRemoval,
  safeRemovalFilter, setSafeRemovalFilter, onStageSafeRemovals,
  stagedSafeRemovals, isDark, themeClasses
}) => {
  const filteredSafes = availableSafesForRemoval.filter(safe =>
    safe.name.toLowerCase().includes(safeRemovalFilter.toLowerCase()) ||
    safe.id.toLowerCase().includes(safeRemovalFilter.toLowerCase())
  );

  const stagedSafeIds = stagedSafeRemovals.map(s => s.id);
  const selectedCount = Object.values(selectedSafesForRemoval).filter(Boolean).length;

  const getRetentionDisplay = (safe) => {
    if (safe.numberOfVersionsRetention) {
      return `${safe.numberOfVersionsRetention} versions`;
    }
    if (safe.numberOfDaysRetention) {
      return `${safe.numberOfDaysRetention} days`;
    }
    return 'Not specified';
  };

  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase mb-8">
        Safe Removal Management
      </h2>

      {/* Filter */}
      <div className="mb-8">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
          Filter Safes
        </label>
        <input
          type="text"
          value={safeRemovalFilter}
          onChange={(e) => setSafeRemovalFilter(e.target.value)}
          placeholder="Search by Safe name or ID..."
          className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
        />
      </div>

      {/* Available Safes List */}
      <div className="mb-8">
        <h3 style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-4">
          Available Safes ({filteredSafes.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSafes.length > 0 ? (
            filteredSafes.map((safe) => (
              <div
                key={safe.id}
                className={`p-4 rounded-lg border transition-all ${stagedSafeIds.includes(safe.id) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
                  selectedSafesForRemoval[safe.id]
                    ? isDark ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-400'
                    : isDark ? 'bg-slate-800 border-slate-700 hover:border-red-500' : 'bg-slate-50 border-slate-200 hover:border-red-400'
                }`}
                onClick={() => {
                  if (!stagedSafeIds.includes(safe.id)) {
                    setSelectedSafesForRemoval({
                      ...selectedSafesForRemoval,
                      [safe.id]: !selectedSafesForRemoval[safe.id]
                    });
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSafesForRemoval[safe.id] || false}
                    disabled={stagedSafeIds.includes(safe.id)}
                    onChange={() => {
                      if (!stagedSafeIds.includes(safe.id)) {
                        setSelectedSafesForRemoval({
                          ...selectedSafesForRemoval,
                          [safe.id]: !selectedSafesForRemoval[safe.id]
                        });
                      }
                    }}
                    className="accent-red-600 w-4 h-4 mt-1 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: themeClasses.text }}>
                      {safe.name}
                    </p>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                        CPM: {safe.managingCPM}
                      </span>
                      <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                        Retention: {getRetentionDisplay(safe)}
                      </span>
                      <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                        ID: {safe.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 italic">
              No Safes found matching your filter
            </div>
          )}
        </div>
      </div>

      {/* Selected Summary & Stage Button */}
      {selectedCount > 0 && (
        <div className={`p-6 rounded-2xl border mb-8 ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'}`}>
          <p style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-2">
            {selectedCount} Safe{selectedCount !== 1 ? 's' : ''} Selected for Removal
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableSafesForRemoval
              .filter(safe => selectedSafesForRemoval[safe.id])
              .map(safe => (
                <span key={safe.id} className="text-[9px] font-bold px-3 py-1 rounded-full bg-red-600 text-white">
                  {safe.name}
                </span>
              ))}
          </div>
        </div>
      )}

      <button
        onClick={onStageSafeRemovals}
        disabled={selectedCount === 0}
        className={`w-full font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
          selectedCount > 0
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
        }`}
      >
        <CircleMinus size={20} /> Stage Safe{selectedCount !== 1 ? 's' : ''} for Removal
      </button>
    </div>
  );
};

// ============================================================================
// MEMBER REMOVAL SECTION
// ============================================================================

const MemberRemovalSection = ({
  availableMembersForRemoval, selectedMembersForRemoval, setSelectedMembersForRemoval,
  memberRemovalFilter, setMemberRemovalFilter, memberRemovalSafeFilter, setMemberRemovalSafeFilter,
  onStageMemberRemovals, stagedMemberRemovals, isDark, themeClasses
}) => {
  const filteredMembers = availableMembersForRemoval.filter(member =>
    (member.member.toLowerCase().includes(memberRemovalFilter.toLowerCase()) ||
     member.domain.toLowerCase().includes(memberRemovalFilter.toLowerCase())) &&
    (memberRemovalSafeFilter === '' || member.safe === memberRemovalSafeFilter)
  );

  const stagedMemberIds = stagedMemberRemovals.map(m => m.id);
  const uniqueSafes = [...new Set(availableMembersForRemoval.map(m => m.safe))];
  const selectedCount = Object.values(selectedMembersForRemoval).filter(Boolean).length;

  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase mb-8">
        Member Removal Management
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
            Filter by Member
          </label>
          <input
            type="text"
            value={memberRemovalFilter}
            onChange={(e) => setMemberRemovalFilter(e.target.value)}
            placeholder="Search member or domain..."
            className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
            Filter by Safe
          </label>
          <select
            value={memberRemovalSafeFilter}
            onChange={(e) => setMemberRemovalSafeFilter(e.target.value)}
            className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          >
            <option value="">All Safes</option>
            {uniqueSafes.map(safe => (
              <option key={safe} value={safe}>{safe}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Available Members List */}
      <div className="mb-8">
        <h3 style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-4">
          Available Members ({filteredMembers.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                className={`p-4 rounded-lg border transition-all ${stagedMemberIds.includes(member.id) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
                  selectedMembersForRemoval[member.id]
                    ? isDark ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-400'
                    : isDark ? 'bg-slate-800 border-slate-700 hover:border-red-500' : 'bg-slate-50 border-slate-200 hover:border-red-400'
                }`}
                onClick={() => {
                  if (!stagedMemberIds.includes(member.id)) {
                    setSelectedMembersForRemoval({
                      ...selectedMembersForRemoval,
                      [member.id]: !selectedMembersForRemoval[member.id]
                    });
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedMembersForRemoval[member.id] || false}
                    disabled={stagedMemberIds.includes(member.id)}
                    onChange={() => {
                      if (!stagedMemberIds.includes(member.id)) {
                        setSelectedMembersForRemoval({
                          ...selectedMembersForRemoval,
                          [member.id]: !selectedMembersForRemoval[member.id]
                        });
                      }
                    }}
                    className="accent-red-600 w-4 h-4 mt-1 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="font-bold" style={{ color: themeClasses.text }}>
                      {member.member}
                      <span className="text-slate-500 font-normal">
                        {' '}@ {member.domain}
                      </span>
                    </p>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <span className="text-[9px] bg-purple-600/10 text-purple-600 px-2 py-0.5 rounded font-bold">
                        Role: {member.role}
                      </span>
                      <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold">
                        Safe: {member.safe}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 italic">
              No Members found matching your filters
            </div>
          )}
        </div>
      </div>

      {/* Selected Summary & Stage Button */}
      {selectedCount > 0 && (
        <div className={`p-6 rounded-2xl border mb-8 ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'}`}>
          <p style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-2">
            {selectedCount} Member{selectedCount !== 1 ? 's' : ''} Selected for Removal
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableMembersForRemoval
              .filter(member => selectedMembersForRemoval[member.id])
              .map(member => (
                <span key={member.id} className="text-[9px] font-bold px-3 py-1 rounded-full bg-red-600 text-white">
                  {member.member}
                </span>
              ))}
          </div>
        </div>
      )}

      <button
        onClick={onStageMemberRemovals}
        disabled={selectedCount === 0}
        className={`w-full font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
          selectedCount > 0
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
        }`}
      >
        <CircleMinus size={20} /> Stage Member{selectedCount !== 1 ? 's' : ''} for Removal
      </button>
    </div>
  );
};

// ============================================================================
// ACCOUNT REMOVAL SECTION
// ============================================================================

const AccountRemovalSection = ({
  availableAccountsForRemoval, selectedAccountsForRemoval, setSelectedAccountsForRemoval,
  accountRemovalFilter, setAccountRemovalFilter, accountRemovalSafeFilter, setAccountRemovalSafeFilter,
  onStageAccountRemovals, stagedAccountRemovals, isDark, themeClasses
}) => {
  const filteredAccounts = availableAccountsForRemoval.filter(account =>
    (account.object.toLowerCase().includes(accountRemovalFilter.toLowerCase()) ||
     account.address.toLowerCase().includes(accountRemovalFilter.toLowerCase()) ||
     account.platform.toLowerCase().includes(accountRemovalFilter.toLowerCase())) &&
    (accountRemovalSafeFilter === '' || account.safeName === accountRemovalSafeFilter)
  );

  const stagedAccountIds = stagedAccountRemovals.map(a => a.id);
  const uniqueSafes = [...new Set(availableAccountsForRemoval.map(a => a.safeName))];
  const selectedCount = Object.values(selectedAccountsForRemoval).filter(Boolean).length;

  return (
    <div className={`p-10 rounded-[2.5rem] border shadow-sm ${themeClasses.card}`}>
      <h2 style={{ color: themeClasses.text }} className="text-xl font-bold uppercase mb-8">
        Account Removal Management
      </h2>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
            Filter by Account/Address
          </label>
          <input
            type="text"
            value={accountRemovalFilter}
            onChange={(e) => setAccountRemovalFilter(e.target.value)}
            placeholder="Search object, address, or platform..."
            className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          />
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
            Filter by Safe
          </label>
          <select
            value={accountRemovalSafeFilter}
            onChange={(e) => setAccountRemovalSafeFilter(e.target.value)}
            className={`w-full p-4 rounded-xl border text-sm outline-none transition-all ${themeClasses.input}`}
          >
            <option value="">All Safes</option>
            {uniqueSafes.map(safe => (
              <option key={safe} value={safe}>{safe}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Available Accounts List */}
      <div className="mb-8">
        <h3 style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-4">
          Available Accounts ({filteredAccounts.length})
        </h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 rounded-lg border transition-all ${stagedAccountIds.includes(account.id) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${
                  selectedAccountsForRemoval[account.id]
                    ? isDark ? 'bg-red-900/30 border-red-600' : 'bg-red-50 border-red-400'
                    : isDark ? 'bg-slate-800 border-slate-700 hover:border-red-500' : 'bg-slate-50 border-slate-200 hover:border-red-400'
                }`}
                onClick={() => {
                  if (!stagedAccountIds.includes(account.id)) {
                    setSelectedAccountsForRemoval({
                      ...selectedAccountsForRemoval,
                      [account.id]: !selectedAccountsForRemoval[account.id]
                    });
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedAccountsForRemoval[account.id] || false}
                    disabled={stagedAccountIds.includes(account.id)}
                    onChange={() => {
                      if (!stagedAccountIds.includes(account.id)) {
                        setSelectedAccountsForRemoval({
                          ...selectedAccountsForRemoval,
                          [account.id]: !selectedAccountsForRemoval[account.id]
                        });
                      }
                    }}
                    className="accent-red-600 w-4 h-4 mt-1 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="font-mono font-bold" style={{ color: themeClasses.text }}>
                      {account.username} <span className="text-red-600">@</span> {account.address}
                    </p>
                    <div className="flex gap-3 mt-2 flex-wrap">
                      <span className="text-[9px] bg-orange-600/10 text-orange-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Layers2 size={10} /> Platform: {account.platform}
                      </span>
                      <span className="text-[9px] bg-blue-600/10 text-blue-600 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                        <Vault size={10} /> Safe: {account.safeName}
                      </span>
                      <span className="text-[9px] bg-slate-500/10 text-slate-600 px-2 py-0.5 rounded font-bold">
                        Object-ID: {account.object}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 italic">
              No Accounts found matching your filters
            </div>
          )}
        </div>
      </div>

      {/* Selected Summary & Stage Button */}
      {selectedCount > 0 && (
        <div className={`p-6 rounded-2xl border mb-8 ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'}`}>
          <p style={{ color: themeClasses.text }} className="font-bold uppercase text-sm mb-2">
            {selectedCount} Account{selectedCount !== 1 ? 's' : ''} Selected for Removal
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableAccountsForRemoval
              .filter(account => selectedAccountsForRemoval[account.id])
              .map(account => (
                <span key={account.id} className="text-[9px] font-bold px-3 py-1 rounded-full bg-red-600 text-white">
                  {account.object}@{account.address}
                </span>
              ))}
          </div>
        </div>
      )}

      <button
        onClick={onStageAccountRemovals}
        disabled={selectedCount === 0}
        className={`w-full font-black py-5 rounded-2xl uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${
          selectedCount > 0
            ? 'bg-red-600 text-white hover:bg-red-700' 
            : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
        }`}
      >
        <CircleMinus size={20} /> Stage Account{selectedCount !== 1 ? 's' : ''} for Removal
      </button>
    </div>
  );
};

export default App;