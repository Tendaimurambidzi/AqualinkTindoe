import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
    // Optionally log error to service
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message || 'An unexpected error occurred.'}</Text>
          <TouchableOpacity onPress={this.handleReload} style={styles.button}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#001a2c' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  message: { fontSize: 16, color: '#fff', marginBottom: 24, textAlign: 'center', paddingHorizontal: 24 },
  button: { backgroundColor: '#1e90ff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});