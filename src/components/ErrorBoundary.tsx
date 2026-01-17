import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};
type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log error details for debugging
    console.error('ErrorBoundary caught error:', error);
    console.error('Error info:', info);
    console.error('Error stack:', error.stack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const errorMessage = error?.message || 'An unexpected error occurred.';
      const errorStack = error?.stack || 'No stack trace available';
      const errorName = error?.name || 'Error';

      return (
        <View style={styles.container}>
          <Text style={styles.title}>🚨 COMPONENT ERROR 🚨</Text>

          <Text style={styles.errorType}>Error Type: {errorName}</Text>

          <Text style={styles.message}>{errorMessage}</Text>

          <Text style={styles.timestamp}>
            Timestamp: {new Date().toISOString()}
          </Text>

          <ScrollView
            style={styles.stackContainer}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.stackTrace}>
              {errorStack}
            </Text>
          </ScrollView>

          <TouchableOpacity onPress={this.handleReload} style={styles.button} delayPressIn={0}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const errorDetails = `Error: ${errorName}\nMessage: ${errorMessage}\nStack:\n${errorStack}\nTimestamp: ${new Date().toISOString()}`;
              console.log('Error details for debugging:', errorDetails);
              Alert.alert('Error Details Logged', 'Error details have been logged to console for debugging.');
            }}
            style={styles.debugButton}
            delayPressIn={0}
          >
            <Text style={styles.debugButtonText}>Copy Debug Info</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#001a2c',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 12,
    textAlign: 'center'
  },
  errorType: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600'
  },
  message: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
    fontWeight: '500'
  },
  timestamp: {
    fontSize: 12,
    color: '#ffff00',
    marginBottom: 16,
    textAlign: 'center'
  },
  stackContainer: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  stackTrace: {
    fontSize: 10,
    color: '#ffffff',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  debugButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  debugButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },
});