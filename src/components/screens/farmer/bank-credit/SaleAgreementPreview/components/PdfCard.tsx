import React, { useState, useRef } from 'react';
import { View } from 'react-native';
import Pdf from 'react-native-pdf';
import { styles } from '../index.styled';

type Props = { 
  uri: string;
  onZoomStateChange?: (isZoomed: boolean) => void;
};

export default function PdfCard({ uri, onZoomStateChange }: Props) {
  const source = { uri, cache: true };
  const [numPages, setNumPages] = useState(0);
  const currentScale = useRef(1.0);

  return (
    <View style={styles.pdfCard}>
      <Pdf
        source={source}
        trustAllCerts={false}
        onError={(error) => {
          console.log('PDF Error:', error);
        }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`PDF loaded: ${numberOfPages} pages`);
          setNumPages(numberOfPages);
        }}
        style={[styles.pdf]}
        // Zoom and scaling configurations
        enablePaging={true}
        horizontal={false}
        minScale={1.0}
        maxScale={3.0}
        scale={1.0}
        spacing={10}
        // Display configurations
        fitPolicy={0} // 0 = fit width, 1 = fit height, 2 = fit both (inside)
        enableAntialiasing={true}
        enableAnnotationRendering={true}
        // Smooth scrolling
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}/${numberOfPages}`);
        }}
        // Handle scale changes to disable parent scroll when zoomed
        onScaleChanged={(scale) => {
          currentScale.current = scale;
          // Notify parent when zoom state changes
          if (onZoomStateChange) {
            onZoomStateChange(scale > 1.0);
          }
        }}
      />
    </View>
  );
}
