import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Optional: Send to crash reporting service
    // crashlytics().recordError(error);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <ScrollView contentContainerStyle={styles.errorScroll}>
            <Text style={styles.errorTitle}>Oops! Something went wrong.</Text>
            <Text style={styles.errorMessage}>
              We've caught an error in the app. You can try restarting or reporting it.
            </Text>
            
            {this.state.error && (
              <>
                <Text style={styles.errorDetailsTitle}>Error Details:</Text>
                <Text style={styles.errorDetails} selectable>
                  {this.state.error.toString()}
                </Text>
              </>
            )}
            
            <TouchableOpacity style={styles.retryButton} onPress={this.resetError}>
              <Text style={styles.retryButtonText}>Restart App</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.reportButton}
              onPress={() => {
                Alert.alert(
                  'Report Error',
                  'Copy error details and share via email or support?',
                  [
                    { text: 'Copy Details', onPress: () => {
                      const message = this.state.error 
                        ? `App Error: ${this.state.error.toString()}\n\nStack: ${this.state.error.stack}`
                        : 'Unknown error occurred.';
                      // Use clipboard here if available
                      Alert.alert('Details Copied', 'Error details copied to clipboard.');
                    }},
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Text style={styles.reportButtonText}>Report Issue</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
  },
  errorScroll: {
    padding: 24,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffd93d',
    marginTop: 16,
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 12,
    color: '#cccccc',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    fontFamily: 'monospace',
    lineHeight: 18,
    maxHeight: 200,
  },
  retryButton: {
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reportButton: {
    backgroundColor: '#ffe66d',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  reportButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ErrorBoundary;
</xai:function_call > 

<xai:function_call name="read_file">
<parameter name="path">c:/Users/user/AqualinkTindoe/src/screens/CreatePostScreen.tsx
