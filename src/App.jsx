import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Save, Download, Trash2, CheckCircle, Plus, Edit2, List, FileText, Settings, Wifi, WifiOff, Upload, TrendingUp, Award, Share2, AlertCircle } from 'lucide-react';

const DataCollectorPro = () => {
  const APP_VERSION = "1.0.0";
  const GOAL_PER_DAY = 15;
  
  const [entries, setEntries] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [surveyTemplates, setSurveyTemplates] = useState([]);
  const [currentMode, setCurrentMode] = useState('field');
  const [currentView, setCurrentView] = useState('collect');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [todayCount, setTodayCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [currentEntry, setCurrentEntry] = useState({
    mode: 'field',
    sector: '',
    item: '',
    value: '',
    unit: 'KES',
    location: '',
    source_name: '',
    source_type: '',
    notes: '',
    photo_note: '',
    photoData: null,
    surveyResponses: {},
    timestamp: new Date().toISOString()
  });

  const [gpsCoords, setGpsCoords] = useState(null);
  const [newSector, setNewSector] = useState({ id: '', name: '', icon: '' });

  const defaultSectors = [
    { id: 'agriculture', name: 'Agriculture', icon: '🌾', color: 'bg-green-600' },
    { id: 'health', name: 'Health', icon: '🏥', color: 'bg-blue-600' },
    { id: 'energy', name: 'Energy', icon: '⚡', color: 'bg-yellow-600' },
    { id: 'water', name: 'Water', icon: '💧', color: 'bg-cyan-600' },
    { id: 'fintech', name: 'Fintech', icon: '💰', color: 'bg-purple-600' },
    { id: 'infrastructure', name: 'Infrastructure', icon: '🏗️', color: 'bg-gray-600' }
  ];

  const defaultSurveys = [
    {
      id: 'tum_student_validation',
      name: 'TUM Student Idea Validation',
      description: 'Survey for TUM students about their innovation ideas',
      questions: [
        { id: 'q1', text: 'What sector is your innovation in?', type: 'select', options: ['Agriculture', 'Health', 'Water', 'Energy', 'Fintech', 'Other'] },
        { id: 'q2', text: 'Describe your innovation in one sentence', type: 'text' },
        { id: 'q3', text: 'What is your target monthly budget?', type: 'number', unit: 'KES' },
        { id: 'q4', text: 'Have you validated this with real users?', type: 'select', options: ['Yes', 'No', 'In Progress'] },
        { id: 'q5', text: 'Main challenge you face?', type: 'text' }
      ]
    },
    {
      id: 'farmer_survey',
      name: 'Farmer Pain Points Survey',
      description: 'Understanding farmer challenges and costs',
      questions: [
        { id: 'q1', text: 'Farm size (acres)', type: 'number', unit: 'acres' },
        { id: 'q2', text: 'Main crop grown', type: 'text' },
        { id: 'q3', text: 'Seed cost per season', type: 'number', unit: 'KES' },
        { id: 'q4', text: 'Fertilizer cost per season', type: 'number', unit: 'KES' },
        { id: 'q5', text: 'Biggest problem you face', type: 'text' },
        { id: 'q6', text: 'Would you use mobile app for farming advice?', type: 'select', options: ['Yes', 'No', 'Maybe'] }
      ]
    },
    {
      id: 'clinic_owner_survey',
      name: 'Small Clinic Owner Survey',
      description: 'Understanding clinic operations and costs',
      questions: [
        { id: 'q1', text: 'Monthly budget (total)', type: 'number', unit: 'KES' },
        { id: 'q2', text: 'Patients per day (average)', type: 'number', unit: 'patients' },
        { id: 'q3', text: 'Power outages per week', type: 'number', unit: 'times' },
        { id: 'q4', text: 'Generator cost per month', type: 'number', unit: 'KES' },
        { id: 'q5', text: 'Biggest operational challenge', type: 'text' }
      ]
    }
  ];

  useEffect(() => {
    const savedEntries = localStorage.getItem('afrifoundry_entries');
    const savedSectors = localStorage.getItem('afrifoundry_sectors');
    const savedSurveys = localStorage.getItem('afrifoundry_surveys');
    
    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedSectors) setSectors(JSON.parse(savedSectors));
    else setSectors(defaultSectors);
    if (savedSurveys) setSurveyTemplates(JSON.parse(savedSurveys));
    else setSurveyTemplates(defaultSurveys);

    // Count today's entries
    const today = new Date().toISOString().split('T')[0];
    const savedEntryData = savedEntries ? JSON.parse(savedEntries) : [];
    const todayEntries = savedEntryData.filter(e => 
      e.temporal?.collected_date === today
    ).length;
    setTodayCount(todayEntries);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('afrifoundry_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('afrifoundry_sectors', JSON.stringify(sectors));
  }, [sectors]);

  useEffect(() => {
    localStorage.setItem('afrifoundry_surveys', JSON.stringify(surveyTemplates));
  }, [surveyTemplates]);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          
          // Validate Kenya boundaries (rough check)
          if (coords.lat < -5 || coords.lat > 5 || coords.lng < 33 || coords.lng > 42) {
            alert('⚠️ GPS coordinates seem outside Kenya. Please verify location.');
          }
          
          setGpsCoords(coords);
          setCurrentEntry({
            ...currentEntry,
            location: `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
          });
        },
        (error) => {
          alert('Could not get location. Please check permissions or enter manually.');
        }
      );
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Compress and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setCurrentEntry({
          ...currentEntry,
          photo_note: `Photo: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`,
          photoData: base64
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateEntry = () => {
    const errors = [];
    
    if (currentMode === 'field') {
      if (!currentEntry.sector) errors.push('Sector required');
      if (!currentEntry.item) errors.push('Item name required');
      if (!currentEntry.value || parseFloat(currentEntry.value) === 0) {
        errors.push('Value must be greater than 0');
      }
      if (parseFloat(currentEntry.value) > 10000000) {
        errors.push('Value seems too high. Please verify.');
      }
    }
    
    if (currentMode === 'survey') {
      if (!currentEntry.sector) errors.push('Survey template required');
    }
    
    return errors;
  };

  const saveEntry = () => {
    const errors = validateEntry();
    if (errors.length > 0) {
      alert('⚠️ Please fix:\n' + errors.join('\n'));
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const validUntil = new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0];
    const nextReview = new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0];

    const structuredEntry = {
      id: `${currentEntry.sector}_${currentMode}_${Date.now()}`,
      mode: currentMode,
      category: currentEntry.sector,
      subcategory: currentMode === 'field' ? 'field_collected' : 'survey_data',
      item: currentEntry.item?.toLowerCase().replace(/\s+/g, '_') || 'survey_response',
      value: parseFloat(currentEntry.value) || 0,
      unit: currentEntry.unit,
      variance: 0,
      currency: 'KES',
      location: {
        region: 'coast',
        county: 'mombasa',
        specificity: 'location_specific',
        gps: gpsCoords ? `${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}` : currentEntry.location
      },
      temporal: {
        collected_date: today,
        valid_until: validUntil,
        next_review: nextReview
      },
      confidence: {
        score: currentMode === 'field' ? 0.95 : 0.85,
        level: currentMode === 'field' ? 'high' : 'medium',
        source_count: 1,
        field_validated: currentMode === 'field'
      },
      sources: [
        {
          type: currentEntry.source_type || (currentMode === 'field' ? 'field_observation' : 'survey'),
          name: currentEntry.source_name || 'Field collection',
          value: parseFloat(currentEntry.value) || 0,
          date: today,
          method: currentMode === 'field' ? 'in_person_verification' : 'survey_response',
          gps_coords: gpsCoords ? `${gpsCoords.lat.toFixed(6)}, ${gpsCoords.lng.toFixed(6)}` : null
        }
      ],
      context: {
        notes: currentEntry.notes,
        photo_reference: currentEntry.photo_note,
        photo_data: currentEntry.photoData,
        survey_responses: currentMode === 'survey' ? currentEntry.surveyResponses : null,
        collected_by: 'AfriFoundry Data Collection v' + APP_VERSION,
        mode: currentMode,
        offline_collected: !isOnline
      },
      temis_relevance: {
        economic: currentMode === 'field' ? 'Field-validated price point' : 'User-reported data',
        technical: 'Real-world availability confirmed'
      }
    };

    setEntries([...entries, structuredEntry]);
    setTodayCount(todayCount + 1);
    
    // Check if goal reached
    if (todayCount + 1 >= GOAL_PER_DAY) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
    
    // Reset form
    setCurrentEntry({
      mode: currentMode,
      sector: '',
      item: '',
      value: '',
      unit: 'KES',
      location: '',
      source_name: '',
      source_type: '',
      notes: '',
      photo_note: '',
      photoData: null,
      surveyResponses: {},
      timestamp: new Date().toISOString()
    });
    setGpsCoords(null);
  };

  const deleteEntry = (index) => {
    if (confirm('Delete this entry?')) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const exportJSON = () => {
    const jsonString = JSON.stringify(entries, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afrifoundry_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const exportCSV = () => {
    if (entries.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = ['Date', 'Sector', 'Item', 'Value', 'Unit', 'Location', 'Source', 'Confidence', 'Mode'];
    const rows = entries.map(e => [
      e.temporal.collected_date,
      e.category,
      e.item,
      e.value,
      e.unit,
      e.location.gps || e.location.region,
      e.sources[0].name,
      (e.confidence.score * 100).toFixed(0) + '%',
      e.mode
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afrifoundry_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const shareData = () => {
    const message = `AfriFoundry Data Collection\n\nTotal entries: ${entries.length}\nField data: ${entries.filter(e => e.mode === 'field').length}\nSurveys: ${entries.filter(e => e.mode === 'survey').length}\n\nCollected with AfriFoundry Data Collector v${APP_VERSION}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'AfriFoundry Data',
        text: message
      });
    } else {
      alert('Share not supported on this device');
    }
  };

  const copyToClipboard = () => {
    const jsonString = JSON.stringify(entries, null, 2);
    navigator.clipboard.writeText(jsonString);
    alert('✅ JSON copied!');
  };

  const addSector = () => {
    if (!newSector.id || !newSector.name) {
      alert('⚠️ Please fill sector ID and name');
      return;
    }
    setSectors([...sectors, { ...newSector, color: 'bg-indigo-600' }]);
    setNewSector({ id: '', name: '', icon: '' });
  };

  const deleteSector = (sectorId) => {
    if (confirm('Delete this sector?')) {
      setSectors(sectors.filter(s => s.id !== sectorId));
    }
  };

  const clearAllData = () => {
    if (confirm('⚠️ WARNING: Delete ALL data?')) {
      if (confirm('Really? This cannot be undone!')) {
        setEntries([]);
        setTodayCount(0);
        localStorage.removeItem('afrifoundry_entries');
      }
    }
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            setEntries([...entries, ...imported]);
            alert(`✅ Imported ${imported.length} entries`);
          } else {
            alert('⚠️ Invalid JSON format');
          }
        } catch (err) {
          alert('⚠️ Error reading file');
        }
      };
      reader.readAsText(file);
    }
  };

  const renderSurveyForm = (template) => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{template.name}</h3>
        <p className="text-sm text-gray-400">{template.description}</p>
        
        {template.questions.map(question => (
          <div key={question.id} className="bg-gray-900 rounded-lg p-4">
            <label className="block text-sm font-medium mb-2">
              {question.text}
              {question.unit && <span className="text-gray-400"> ({question.unit})</span>}
            </label>
            
            {question.type === 'text' && (
              <input
                type="text"
                onChange={(e) => setCurrentEntry({
                  ...currentEntry,
                  surveyResponses: {
                    ...currentEntry.surveyResponses,
                    [question.id]: e.target.value
                  }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            )}
            
            {question.type === 'number' && (
              <input
                type="number"
                onChange={(e) => setCurrentEntry({
                  ...currentEntry,
                  surveyResponses: {
                    ...currentEntry.surveyResponses,
                    [question.id]: e.target.value
                  }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            )}
            
            {question.type === 'select' && (
              <select
                onChange={(e) => setCurrentEntry({
                  ...currentEntry,
                  surveyResponses: {
                    ...currentEntry.surveyResponses,
                    [question.id]: e.target.value
                  }
                })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Select...</option>
                {question.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Settings View
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setCurrentView('collect')}
            className="mb-4 text-gray-400 hover:text-white"
          >
            ← Back
          </button>

          <h1 className="text-3xl font-bold mb-6">⚙️ Settings</h1>

          {/* Manage Sectors */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Manage Sectors</h2>
            
            <div className="space-y-2 mb-4">
              {sectors.map(sector => (
                <div key={sector.id} className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
                  <span className="flex items-center gap-2">
                    <span className="text-2xl">{sector.icon}</span>
                    <span className="font-medium">{sector.name}</span>
                  </span>
                  <button
                    onClick={() => deleteSector(sector.id)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="font-semibold mb-3">Add New Sector</h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="ID"
                  value={newSector.id}
                  onChange={(e) => setNewSector({ ...newSector, id: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={newSector.name}
                  onChange={(e) => setNewSector({ ...newSector, name: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="Icon"
                  value={newSector.icon}
                  onChange={(e) => setNewSector({ ...newSector, icon: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                onClick={addSector}
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg text-sm font-medium"
              >
                Add Sector
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Data Management</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Total Entries</span>
                <strong>{entries.length}</strong>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Storage Used</span>
                <strong>{(JSON.stringify(entries).length / 1024).toFixed(2)}KB</strong>
              </div>

              <div className="border-t border-gray-700 pt-3 space-y-2">
                <button
                  onClick={exportJSON}
                  className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Export JSON
                </button>

                <button
                  onClick={exportCSV}
                  className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  Export CSV (Excel)
                </button>

                <label className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={18} />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={clearAllData}
                  className="w-full bg-red-600 hover:bg-red-700 py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-sm text-gray-400 mb-3">
              AfriFoundry Data Collector Pro
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Version: {APP_VERSION}</div>
              <div>Developer: Mark Gakuya</div>
              <div>Company: AfriFoundry AI</div>
              <div>Purpose: Ground-truth African innovation data collection</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Entries View
  if (currentView === 'entries') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setCurrentView('collect')}
            className="mb-4 text-gray-400 hover:text-white"
          >
            ← Back
          </button>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">📊 Data ({entries.length})</h1>
            <div className="flex gap-2">
              <button
                onClick={shareData}
                className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Share2 size={16} />
              </button>
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={exportJSON}
                className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Download size={16} />
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Field Data</p>
              <p className="text-2xl font-bold text-green-400">
                {entries.filter(e => e.mode === 'field').length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Surveys</p>
              <p className="text-2xl font-bold text-purple-400">
                {entries.filter(e => e.mode === 'survey').length}
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Avg Confidence</p>
              <p className="text-2xl font-bold text-blue-400">
                {entries.length > 0 ? 
                  (entries.reduce((sum, e) => sum + e.confidence.score, 0) / entries.length * 100).toFixed(0) 
                  : 0}%
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <p className="text-gray-400 mb-4">No entries yet</p>
                <button
                  onClick={() => setCurrentView('collect')}
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
                >
                  Start Collecting
                </button>
              </div>
            ) : (
              entries.map((entry, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {entry.mode === 'survey' ? '📋 Survey' : entry.item.replace(/_/g, ' ')}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {entry.category} • {entry.sources[0].name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.mode === 'field' && (
                        <span className="text-xl font-bold text-green-400">
                          {entry.unit === 'KES' ? 'KES ' : ''}{entry.value.toLocaleString()}
                        </span>
                      )}
                      <button
                        onClick={() => deleteEntry(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-gray-900 px-2 py-1 rounded">
                      📍 {entry.location.gps || entry.location.region}
                    </span>
                    <span className={`px-2 py-1 rounded ${entry.confidence.field_validated ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                      {entry.confidence.field_validated ? '✓ Field' : '📋 Survey'} ({(entry.confidence.score * 100).toFixed(0)}%)
                    </span>
                    {entry.context.photo_data && (
                      <span className="bg-purple-900 px-2 py-1 rounded text-purple-300">
                        📸 Photo
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Collect View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                🔥
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  AfriFoundry
                </h1>
                <p className="text-xs text-gray-400">Data Collector Pro v{APP_VERSION}</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              {isOnline ? <span className="text-green-400">● Online</span> : <span className="text-orange-400">● Offline</span>}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('entries')}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg relative"
            >
              <List size={20} />
              {entries.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {entries.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Today's Goal */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Goal</span>
            <span className="text-sm">{todayCount}/{GOAL_PER_DAY}</span>
          </div>
          <div className="w-full bg-gray-800/50 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${Math.min((todayCount / GOAL_PER_DAY) * 100, 100)}%` }}
            />
          </div>
          {todayCount >= GOAL_PER_DAY && (
            <p className="text-xs mt-2 text-white/90">🎉 Goal reached! Great work!</p>
          )}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-green-600 rounded-lg p-4 mb-6 animate-pulse">
            <div className="flex items-center gap-3">
              <Award size={24} />
              <div>
                <p className="font-semibold">🎉 Daily Goal Achieved!</p>
                <p className="text-sm text-green-100">Excellent work collecting data today!</p>
              </div>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setCurrentMode('field')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              currentMode === 'field'
                ? 'bg-gradient-to-r from-green-500 to-blue-500'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            📍 Field Data
          </button>
          <button
            onClick={() => setCurrentMode('survey')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
              currentMode === 'survey'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            📋 Survey
          </button>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          {currentMode === 'field' ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Field Data Entry</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Sector *</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sectors.map(sector => (
                    <button
                      key={sector.id}
                      onClick={() => setCurrentEntry({ ...currentEntry, sector: sector.id })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        currentEntry.sector === sector.id
                          ? `${sector.color} border-white`
                          : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <span className="text-sm font-medium">{sector.icon} {sector.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Item Name *</label>
                <input
                  type="text"
                  value={currentEntry.item}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, item: e.target.value })}
                  placeholder="H516 Maize Seed"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Value *</label>
                  <input
                    type="number"
                    value={currentEntry.value}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, value: e.target.value })}
                    placeholder="2400"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Unit</label>
                  <select
                    value={currentEntry.unit}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, unit: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="KES">KES</option>
                    <option value="KES_per_kg">KES/kg</option>
                    <option value="KES_per_acre">KES/acre</option>
                    <option value="hours">hours</option>
                    <option value="percent">%</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Source</label>
                <input
                  type="text"
                  value={currentEntry.source_name}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, source_name: e.target.value })}
                  placeholder="Bamburi Agro-Vet"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentEntry.location}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, location: e.target.value })}
                    placeholder="Mombasa, Bamburi"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={getLocation}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <MapPin size={18} />
                    GPS
                  </button>
                </div>
                {gpsCoords && (
                  <p className="text-xs text-green-400 mt-1">
                    ✓ GPS: ±{gpsCoords.accuracy.toFixed(0)}m
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={currentEntry.notes}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })}
                  placeholder="Observations..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Photo</label>
                <label className="w-full bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg px-4 py-2 cursor-pointer flex items-center gap-2">
                  <Camera size={18} />
                  <span className="text-sm">{currentEntry.photo_note || 'Capture Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Survey Mode</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Survey Template *</label>
                <select
                  value={currentEntry.sector}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, sector: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Choose survey...</option>
                  {surveyTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentEntry.sector && surveyTemplates.find(t => t.id === currentEntry.sector) && (
                <div className="mb-6">
                  {renderSurveyForm(surveyTemplates.find(t => t.id === currentEntry.sector))}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentEntry.location}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, location: e.target.value })}
                    placeholder="TUM, Mombasa"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={getLocation}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                  >
                    <MapPin size={18} />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={currentEntry.notes}
                  onChange={(e) => setCurrentEntry({ ...currentEntry, notes: e.target.value })}
                  placeholder="Additional context..."
                  rows={2}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <button
            onClick={saveEntry}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save {currentMode === 'field' ? 'Field Data' : 'Survey'}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Total</p>
            <p className="text-2xl font-bold">{entries.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Field</p>
            <p className="text-2xl font-bold text-green-400">
              {entries.filter(e => e.mode === 'field').length}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Surveys</p>
            <p className="text-2xl font-bold text-purple-400">
              {entries.filter(e => e.mode === 'survey').length}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>AfriFoundry Data Collector Pro • v{APP_VERSION}</p>
          <p className="mt-1">Building Africa's Innovation Intelligence Database</p>
        </div>
      </div>
    </div>
  );
};

export default DataCollectorPro;