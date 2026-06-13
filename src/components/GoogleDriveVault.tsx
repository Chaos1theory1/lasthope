import React, { useState, useEffect, useRef } from "react";
import {
  Cloud,
  FolderPlus,
  Folder,
  File,
  Download,
  Trash2,
  Search,
  Share2,
  ExternalLink,
  Lock,
  RefreshCw,
  FileText,
  CheckCircle,
  AlertTriangle,
  UploadCloud,
  X,
  Paperclip,
  Loader2,
  Plus
} from "lucide-react";
import { Product } from "../types";

interface GoogleDriveVaultProps {
  products: Product[];
  onBindDocumentToProduct?: (productId: string, docUrl: string) => void;
}

export default function GoogleDriveVault({
  products,
  onBindDocumentToProduct
}: GoogleDriveVaultProps) {
  // Authentication states
  const [accessToken, setAccessToken] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  
  // Custom GDrive Client ID input (Default to the user's project or standard sandbox)
  const [clientId, setClientId] = useState<string>("906352937216-oauth-client.apps.googleusercontent.com");
  const [customToken, setCustomToken] = useState<string>("");
  const [showConfig, setShowConfig] = useState<boolean>(false);

  // File explorer states
  const [files, setFiles] = useState<any[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string>("root");
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string; name: string }>>([
    { id: "root", name: "My Drive" }
  ]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [fileListError, setFileListError] = useState<string>("");

  // Create folder states
  const [showNewFolderModal, setShowNewFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);

  // Upload file states
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>("");

  // Product linkage states
  const [selectedFileForBind, setSelectedFileForBind] = useState<any | null>(null);
  const [showBindModal, setShowBindModal] = useState<boolean>(false);
  const [targetProductId, setTargetProductId] = useState<string>("");

  // File deletion state (Double confirm requirement)
  const [fileToDelete, setFileToDelete] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Parse implicit grant token from hash on mounting
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      if (token) {
        setAccessToken(token);
        setAuthError("");
        // Clean hash from URL without reloading
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  // Fetch file directory when token or active folder changes
  useEffect(() => {
    if (accessToken) {
      fetchFiles();
    }
  }, [accessToken, currentFolderId]);

  // Initiate implicit OAuth flow with popup
  const handleGoogleSignIn = () => {
    setAuthError("");
    try {
      const redirectUri = window.location.origin + window.location.pathname;
      const scopes = "https://www.googleapis.com/auth/drive";
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scopes)}&state=biotech_gdrive&prompt=consent`;
      
      // Redirect or popup depending on execution context
      window.location.href = oauthUrl;
    } catch (err: any) {
      setAuthError("Failed to initialize Google Authentication: " + err.message);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customToken.trim()) {
      setAccessToken(customToken.trim());
      setAuthError("");
      setShowConfig(false);
    }
  };

  // Fetch Google Drive files using robust fetch requests
  const fetchFiles = async (searchOverride?: string) => {
    setIsLoadingFiles(true);
    setFileListError("");
    try {
      let query = `'${currentFolderId}' in parents and trashed = false`;
      
      const term = searchOverride !== undefined ? searchOverride : searchQuery;
      if (term.trim()) {
        query = `name contains '${term.replace(/'/g, "\\'")}' and trashed = false`;
      }

      const fields = "files(id, name, mimeType, size, createdTime, webViewLink, thumbnailLink, iconLink)";
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&orderBy=folder%2Cname&pageSize=50`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your access session has expired. Please sign in to Google Drive again.");
        }
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "Google Drive sync error.");
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.error("GDrive Fetch Error:", err);
      setFileListError(err.message);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Navigate down into folder
  const handleFolderClick = (folderId: string, folderName: string) => {
    setSearchQuery("");
    setFolderHistory(prev => [...prev, { id: folderId, name: folderName }]);
    setCurrentFolderId(folderId);
  };

  // Breadcrumb navigation tracking
  const handleBreadcrumbClick = (index: number) => {
    setSearchQuery("");
    const newHistory = folderHistory.slice(0, index + 1);
    setFolderHistory(newHistory);
    setCurrentFolderId(newHistory[newHistory.length - 1].id);
  };

  // Create new directory / folder with metadata payload
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const response = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          mimeType: "application/vnd.google-apps.folder",
          parents: currentFolderId !== "root" ? [currentFolderId] : undefined
        })
      });

      if (!response.ok) {
        throw new Error("Unable to create lab folder.");
      }

      setNewFolderName("");
      setShowNewFolderModal(false);
      // Refresh directory
      fetchFiles();
    } catch (err: any) {
      alert("Error creating folder: " + err.message);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Multipurpose File Upload via Google Multipart Service
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) return;

    setIsUploading(true);
    setUploadError("");
    try {
      // 1. Initialize metadata block
      const metadata = {
        name: selectedUploadFile.name,
        parents: currentFolderId !== "root" ? [currentFolderId] : undefined
      };

      const boundary = "314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--\r\n`;

      const reader = new FileReader();
      
      const uploadPromise = new Promise<void>((resolve, reject) => {
        reader.onload = async () => {
          try {
            const rawBinary = reader.result as ArrayBuffer;
            
            // Construct multipart body
            const metadataPart = JSON.stringify(metadata);
            
            const header = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${metadataPart}\r\n${delimiter}Content-Type: ${selectedUploadFile.type || "application/octet-stream"}\r\nContent-Transfer-Encoding: base64\r\n\r\n`;
            
            // Encode binary content in secure base64 for multipart standard
            const base64Content = btoa(
              new Uint8Array(rawBinary).reduce((data, byte) => data + String.fromCharCode(byte), "")
            );
            
            const completeMultipartBody = header + base64Content + closeDelimiter;

            const uploadUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
            const response = await fetch(uploadUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": `multipart/related; boundary=${boundary}`
              },
              body: completeMultipartBody
            });

            if (!response.ok) {
              const errJson = await response.json();
              throw new Error(errJson?.error?.message || "Google file upload rejected.");
            }

            resolve();
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("File reading issue."));
        reader.readAsArrayBuffer(selectedUploadFile);
      });

      await uploadPromise;
      setSelectedUploadFile(null);
      fetchFiles();
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Execute Destructive Operation (Requires user double confirm modal)
  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error("Unable to remove resource from Drive.");
      }

      setFileToDelete(null);
      setShowDeleteConfirm(false);
      fetchFiles();
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Link document to specific agricultural product
  const handleBindConfirm = () => {
    if (!selectedFileForBind || !targetProductId) return;
    
    if (onBindDocumentToProduct) {
      onBindDocumentToProduct(targetProductId, selectedFileForBind.webViewLink);
      alert(`Successfully linked Google Drive File "${selectedFileForBind.name}" to your selected catalog product spec!`);
    }
    
    setShowBindModal(false);
    setSelectedFileForBind(null);
    setTargetProductId("");
  };

  // Utility to convert file size
  const formatBytes = (bytes?: string, decimals = 1) => {
    if (!bytes) return "Folder";
    const num = parseInt(bytes, 10);
    if (isNaN(num) || num === 0) return "0 Bytes";
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-stone-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 bg-blue-100 text-blue-800 text-[9px] font-mono font-bold uppercase rounded-md tracking-wider">WORKSPACE DRIVE</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold font-mono">100% REAL LIVE API</span>
          </div>
          <h3 className="font-display font-bold text-lg text-stone-900">Lab Research Document Vault</h3>
          <p className="text-xs text-stone-400">Connect Google Drive to manage lab reports, certified analysis sheets (COA), or technical mushroom grow sheets.</p>
        </div>
        
        {accessToken && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchFiles()}
              className="p-2 text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors"
              title="Refresh Folder"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAccessToken("");
                setFolderHistory([{ id: "root", name: "My Drive" }]);
                setCurrentFolderId("root");
                setFiles([]);
              }}
              className="text-xs px-2.5 h-8 font-mono bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800 rounded-lg font-bold border border-stone-250 transition-all cursor-pointer"
            >
              Disconnect Drive
            </button>
          </div>
        )}
      </div>

      {authError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-mono flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* STAGE A: RETRIEVE ACCESS TOKEN (NEEDS GOOGLE OAUTH OR DEV FALLBACK) */}
      {!accessToken ? (
        <div className="flex flex-col items-center justify-center p-8 bg-stone-50 border border-dashed border-stone-200 rounded-2xl text-center space-y-6">
          <div className="p-4 bg-blue-50 text-blue-800 rounded-full border border-blue-100">
            <Cloud className="w-10 h-10 animate-bounce" />
          </div>
          
          <div className="max-w-md space-y-2">
            <h4 className="font-display font-bold text-stone-950 text-base">Connect Google Workspace Drive</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Link your secure agricultural lab account to fetch, create, and attach real documents to your Biotech Agro product catalog items.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
            {/* Compliance with custom Google GSI styles */}
            <button onClick={handleGoogleSignIn} className="gsi-material-button text-xs select-none">
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents text-stone-700 font-bold font-mono">Sign in with Google Account</span>
              </div>
            </button>

            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-[10px] font-mono font-semibold text-stone-500 hover:text-stone-800 underline uppercase tracking-wider"
            >
              Expert Credentials Mode (Token Fallback)
            </button>
          </div>

          {showConfig && (
            <form onSubmit={handleManualTokenSubmit} className="w-full max-w-sm bg-white p-4 border border-stone-250 rounded-xl text-left space-y-3 shadow-xs">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#1c241d] uppercase block">OAUTH CREDENTIAL CONFIG</span>
              
              <div className="space-y-1">
                <label className="text-[10px] font-medium text-stone-700 block">Google Client ID</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-[#fcfcf9] border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-900 focus:outline-hidden font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-medium text-stone-700 block">Manual Access Token</label>
                <textarea
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="Paste access_token from OAuth Playground..."
                  className="w-full bg-[#fcfcf9] border border-stone-200 rounded-lg px-2.5 py-1 text-xs text-stone-900 focus:outline-hidden font-mono h-16 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-8 bg-stone-900 hover:bg-stone-850 text-white rounded-lg text-xs font-semibold tracking-wider cursor-pointer"
              >
                Apply Token Configuration
              </button>
            </form>
          )}
        </div>
      ) : (
        /* STAGE B: WORKSPACE FILE LISTINGS, FOLDERS, AND MULTIPART UPLOADS */
        <div className="space-y-4">
          
          {/* Upper Actions Toolbar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Search files */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search documents by name in Drive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchFiles();
                  }
                }}
                className="w-full h-10 bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 text-xs focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3.5" />
            </div>

            {/* Folder creation and file upload triggers */}
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="flex items-center gap-1 px-3 h-10 bg-stone-50 hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-emerald-800" />
                <span>New Folder</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 h-10 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-dashed border border-emerald-250 rounded-xl text-xs font-bold transition-all cursor-pointer">
                <UploadCloud className="w-4 h-4 text-emerald-700" />
                <span>Upload File</span>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) {
                      setSelectedUploadFile(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* New Folder Modal (Inline/Standard) */}
          {showNewFolderModal && (
            <form onSubmit={handleCreateFolderSubmit} className="p-4 bg-emerald-50 border border-emerald-250 rounded-xl flex items-center gap-3">
              <div className="space-y-0.5 shrink-0">
                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-800 uppercase">Create Folder</span>
              </div>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g., Lab analysis"
                className="bg-white border border-stone-200 rounded-lg px-3 py-1.5 text-xs text-stone-900 focus:outline-hidden w-full max-w-xs"
                required
              />
              <button
                type="submit"
                disabled={isCreatingFolder}
                className="px-3 h-8 bg-emerald-800 hover:bg-emerald-900 text-white disabled:opacity-40 rounded-lg text-xs font-semibold cursor-pointer shrink-0"
              >
                {isCreatingFolder ? "Creating..." : "Save folder"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewFolderName("");
                  setShowNewFolderModal(false);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Pending Upload Banner */}
          {selectedUploadFile && (
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                  <span className="font-semibold text-xs text-blue-900">{selectedUploadFile.name}</span>
                </div>
                <p className="text-[10px] text-blue-500 font-mono">
                  Type: {selectedUploadFile.type || "unknown"} | Size: {formatBytes(selectedUploadFile.size.toString())}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={isUploading}
                  className="px-3 h-8 bg-blue-800 hover:bg-blue-900 text-white disabled:opacity-40 rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0"
                >
                  {isUploading ? "Uploading to GDrive..." : "Send to Google Drive"}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUploadFile(null)}
                  className="p-1.5 bg-stone-100 hover:bg-stone-250 text-stone-500 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs leading-relaxed">
              <strong>Upload Failed:</strong> {uploadError}
            </div>
          )}

          {/* Directory Breadcrumb Path */}
          <div className="flex items-center gap-1 text-xs text-stone-500 font-medium overflow-x-auto py-1">
            <Cloud className="w-4 h-4 text-blue-700 shrink-0" />
            {folderHistory.map((folder, index) => (
              <React.Fragment key={folder.id}>
                {index > 0 && <span className="text-stone-300">/</span>}
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`hover:text-stone-900 hover:underline cursor-pointer shrink-0 whitespace-nowrap ${
                    index === folderHistory.length - 1 ? "text-stone-900 font-bold" : ""
                  }`}
                >
                  {folder.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* MAIN GRID LISTINGS */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden shadow-xs">
            {isLoadingFiles ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-800" />
                <span className="text-xs text-stone-400 font-mono">Syncing directories...</span>
              </div>
            ) : fileListError ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-rose-700" />
                <p className="text-xs text-rose-800 font-medium">{fileListError}</p>
                <button
                  onClick={() => fetchFiles()}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 rounded text-xs text-stone-700 border"
                >
                  Retry Connection
                </button>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 text-xs text-stone-400 font-light">
                {searchQuery ? "No matching files found in this vault." : "This Google Drive folder is currently empty."}
              </div>
            ) : (
              <div className="divide-y divide-stone-200 max-h-[460px] overflow-y-auto">
                {files.map((file) => {
                  const isFolder = file.mimeType === "application/vnd.google-apps.folder";

                  return (
                    <div
                      key={file.id}
                      className="p-3 bg-white hover:bg-stone-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 w-full">
                        {isFolder ? (
                          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
                            <Folder className="w-4 h-4 fill-emerald-100" />
                          </div>
                        ) : (
                          <div className="p-2 bg-blue-50 text-blue-800 rounded-lg">
                            <File className="w-4 h-4" />
                          </div>
                        )}
                        <div className="space-y-0.5 min-w-0">
                          {isFolder ? (
                            <button
                              onClick={() => handleFolderClick(file.id, file.name)}
                              className="font-semibold text-xs text-stone-900 hover:text-emerald-950 hover:underline text-left block truncate cursor-pointer font-display"
                            >
                              {file.name}
                            </button>
                          ) : (
                            <span className="font-semibold text-xs text-stone-900 block truncate font-sans">
                              {file.name}
                            </span>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                            <span>{formatBytes(file.size)}</span>
                            <span>●</span>
                            <span>Created {new Date(file.createdTime).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right metadata actions */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                        {!isFolder && (
                          <button
                            onClick={() => {
                              setSelectedFileForBind(file);
                              setTargetProductId(products[0]?.id || "");
                              setShowBindModal(true);
                            }}
                            className="p-1 px-1.5 h-7 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[10px] font-bold font-mono tracking-wide cursor-pointer transition-colors flex items-center gap-1 border border-blue-100"
                            title="Attach to Catalog"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span>Link to Product</span>
                          </button>
                        )}
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-stone-50 hover:bg-stone-100 text-stone-600 hover:text-stone-900 border border-stone-200 rounded-lg transition-colors"
                          title="Open View Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => {
                            setFileToDelete(file);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Remove File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPLIANCE WARNING & DELETE CONFIRMATION DIAG (DOUBLE CONFIRM MANDATE!) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="text-center space-y-2">
              <div className="p-3 bg-rose-50 text-rose-700 rounded-2xl w-fit mx-auto border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-stone-900">Lab Document Deletion</h4>
              <p className="text-xs text-stone-400 leading-relaxed">
                Are you sure you want to permanently delete <strong>{fileToDelete?.name}</strong> from Google Drive? This operation cannot be unsuspended.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFileToDelete(null);
                  setShowDeleteConfirm(false);
                }}
                className="w-full h-10 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                No, cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="w-full h-10 bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-40 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BIND TO PRODUCT SELECTION DIALOG */}
      {showBindModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="text-center space-y-2">
              <div className="p-3 bg-blue-50 text-blue-800 rounded-2xl w-fit mx-auto border border-blue-100">
                <Paperclip className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-lg text-stone-900">Link Drive Document</h4>
              <p className="text-xs text-stone-400">
                Bind the high-trust laboratory certificate or sheet link to a current Biotech Agro catalog item:
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl text-xs text-stone-700 font-mono">
                <strong>Document Context:</strong> {selectedFileForBind?.name}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-[#1c241d] tracking-widest block uppercase">SELECT ASSOCIATED SPECIMEN</label>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full bg-[#fcfcf9] border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-hidden"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedFileForBind(null);
                  setShowBindModal(false);
                  setTargetProductId("");
                }}
                className="w-full h-10 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleBindConfirm}
                className="w-full h-10 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Confirm Linkage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
