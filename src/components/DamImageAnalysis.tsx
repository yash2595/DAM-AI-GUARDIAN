import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Upload, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const DamImageAnalysis = () => {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    damName: '',
    location: '',
    damType: 'Concrete',
    constructionYear: new Date().getFullYear()
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'constructionYear' ? parseInt(value) : value
    }));
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !formData.damName) {
      setError('Please select an image and enter dam name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);
      uploadFormData.append('damName', formData.damName);
      uploadFormData.append('location', formData.location);
      uploadFormData.append('damType', formData.damType);
      uploadFormData.append('constructionYear', formData.constructionYear.toString());

      const response = await fetch('/api/dam/analyze', {
        method: 'POST',
        body: uploadFormData
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        let errorMessage = 'Analysis failed';
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Received invalid response from server. Make sure the backend is running.');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getConditionIcon = (conditionScore: number) => {
    if (conditionScore >= 85) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (conditionScore >= 70) return <CheckCircle className="w-6 h-6 text-green-400" />;
    if (conditionScore >= 50) return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    if (conditionScore >= 30) return <AlertTriangle className="w-6 h-6 text-orange-500" />;
    return <XCircle className="w-6 h-6 text-red-500" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">🏗️ Dam Physical Condition Analysis</h1>
        <p className="text-gray-600">Upload a photo of your dam to analyze its physical condition</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Dam Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Dam Name *</label>
                <Input
                  name="damName"
                  value={formData.damName}
                  onChange={handleInputChange}
                  placeholder="e.g., Bhakra Dam"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Himachal Pradesh"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dam Type</label>
                <select
                  name="damType"
                  value={formData.damType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={loading}
                >
                  <option value="Concrete">Concrete</option>
                  <option value="Earthen">Earthen</option>
                  <option value="Arch">Arch</option>
                  <option value="Buttress">Buttress</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Construction Year</label>
                <Input
                  name="constructionYear"
                  type="number"
                  value={formData.constructionYear}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={loading}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full rounded-lg max-h-48 object-cover"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={loading || !selectedFile || !formData.damName}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Dam Condition'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results Section */}
        <div className="space-y-4">
          {analysisResult && (
            <>
              {/* Overall Condition */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getConditionIcon(analysisResult.analysis?.condition_score || 0)}
                    Condition Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Condition Level</p>
                      <p className="text-lg font-bold">
                        {['Excellent', 'Good', 'Fair', 'Poor', 'Critical'][analysisResult.analysis?.overall_condition || 0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Condition Score</p>
                      <p className="text-lg font-bold">{analysisResult.analysis?.condition_score || 0}/100</p>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg border ${getRiskColor(analysisResult.analysis?.risk_level)}`}>
                    <p className="font-medium">Risk Level: {analysisResult.analysis?.risk_level}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 mb-1">Next Inspection</p>
                    <p className="font-medium">{analysisResult.analysis?.next_inspection}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.analysis?.analysis && Object.entries(analysisResult.analysis.analysis).map(([key, value]: any) => (
                    <div key={key} className="pb-3 border-b last:border-b-0">
                      <p className="font-medium text-sm capitalize">{key.replace(/_/g, ' ')}</p>
                      <div className="text-sm text-gray-600 mt-1">
                        {value.severity && <p>Severity: {value.severity}</p>}
                        {value.level && <p>Level: {value.level}</p>}
                        {value.coverage !== undefined && <p>Coverage: {value.coverage.toFixed(2)}%</p>}
                        {value.detected !== undefined && <p>Status: {value.detected ? '✓ Detected' : '✗ Not detected'}</p>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recommendations */}
              {analysisResult.analysis?.recommendations && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysisResult.analysis.recommendations.map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!analysisResult && !loading && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800">
                  Upload a high-quality photo of your dam to get a detailed physical condition assessment including detection of cracks, wear, moisture, erosion, and structural damage.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DamImageAnalysis;
