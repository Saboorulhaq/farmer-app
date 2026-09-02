import React from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { UITypography, UIIconButton } from '@/components/ui';
import { styles } from './CreditProfileScreen.styled';
import ChevronLeftIcon from '@/components/icons/ChevronLeftIcon';
import Avatar from '@/assets/images/avatar.png';
import CheckIcon from '@/components/icons/CheckIcon';
import LockIcon from '@/components/icons/FingerprintIcon';
import VectorCheckmarkIcon from '@/components/icons/VectorCheckmarkIcon';
import FarmIcon from '@/components/icons/FarmIcon';
import ClipboardIcon from '@/components/icons/ClipboardIcon';
import RightArrowIcon from '@/components/icons/RightArrowIcon';
import { useFarmer } from '@/constants/context/farmer/context';
import Svg, { Path, G } from 'react-native-svg';

// Credit Gauge Component - Creates a semicircular gauge with 5 segments
function CreditGauge() {
  const { width: screenWidth } = useWindowDimensions();
  
  // Responsive gauge dimensions - smaller on small screens
  const isSmallScreen = screenWidth < 380;
  const baseWidth = isSmallScreen ? 110 : 140;
  const baseHeight = isSmallScreen ? 65 : 85;
  const outerRadius = isSmallScreen ? 50 : 65;
  const innerRadius = isSmallScreen ? 27 : 35;
  
  const width = baseWidth;
  const height = baseHeight;
  const cx = width / 2; // center x
  const cy = outerRadius + 5; // center y (position to fit semicircle)
  
  // Helper to create arc path for a gauge segment
  const createArcSegment = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Outer arc points
    const outerStartX = cx + outerRadius * Math.cos(startRad);
    const outerStartY = cy + outerRadius * Math.sin(startRad);
    const outerEndX = cx + outerRadius * Math.cos(endRad);
    const outerEndY = cy + outerRadius * Math.sin(endRad);
    
    // Inner arc points
    const innerStartX = cx + innerRadius * Math.cos(endRad);
    const innerStartY = cy + innerRadius * Math.sin(endRad);
    const innerEndX = cx + innerRadius * Math.cos(startRad);
    const innerEndY = cy + innerRadius * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${outerStartX} ${outerStartY} 
            A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}
            L ${innerStartX} ${innerStartY}
            A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerEndX} ${innerEndY}
            Z`;
  };
  
  // 5 segments from 180° to 360° (left to right)
  // Each segment is 36° (180/5)
  const segments = [
    { start: 180, end: 216, opacity: 0.2 },
    { start: 216, end: 252, opacity: 0.4 },
    { start: 252, end: 288, opacity: 0.6 },
    { start: 288, end: 324, opacity: 0.8 },
    { start: 324, end: 360, opacity: 1 },
  ];
  
  // Needle angle - pointing to center (straight up at 270°)
  const needleAngle = 270;
  const needleRotation = needleAngle - 180; // Rotation from horizontal
  
  // The pointer SVG has its pivot at x=33, y=13 (center of circle)
  // We need to position this at our gauge center (cx, cy)
  const pointerScale = 0.8;
  const pointerPivotX = 33;
  const pointerPivotY = 13;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Gauge segments */}
        {segments.map((segment, index) => (
          <Path
            key={index}
            d={createArcSegment(segment.start, segment.end)}
            fill="#099453"
            opacity={segment.opacity}
          />
        ))}
        {/* Pointer pin from Figma */}
        <G 
          transform={`
            translate(${cx}, ${cy})
            scale(${pointerScale})
            rotate(${needleRotation})
            translate(${-pointerPivotX}, ${-pointerPivotY})
          `}
        >
          {/* Needle pin shape */}
          <Path
            d="M1.09749 3.84687L34.8902 9.32908L33.6542 10.0163L32.4182 10.7036L31.5 11.5L30.9078 12.3524L30.5 13.5L32.3516 16.4041L32.6952 17.0221L1.09749 3.84687Z"
            fill="#404040"
          />
          {/* Circular base with inner ring */}
          <Path
            d="M33 8.99805C35.2091 8.99805 37 10.7889 37 12.998C37 15.2072 35.2091 16.998 33 16.998C30.7909 16.998 29 15.2072 29 12.998C29 10.7889 30.7909 8.99805 33 8.99805ZM33 10.998C31.8954 10.998 31 11.8935 31 12.998C31 14.1026 31.8954 14.998 33 14.998C34.1046 14.998 35 14.1026 35 12.998C35 11.8935 34.1046 10.998 33 10.998Z"
            fill="#404040"
          />
        </G>
      </Svg>
    </View>
  );
}

interface CreditCardProps {
  title: string;
  score: string;
  maxScore: string;
  status: 'good' | 'moderate';
  icon: React.ReactNode;
  items: Array<{ label: string; checked: boolean }>;
}

function CreditCard({ title, score, maxScore, status, icon, items }: CreditCardProps) {
  const statusColor = status === 'good' ? '#3DD598' : '#FFE19C';
  const statusBgColor = status === 'good' ? '#E9FFF5' : 'rgba(255, 225, 156, 0.6)';
  const statusText = status === 'good' ? 'GOOD' : 'MODERATE';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          {icon}
          <UITypography variant="semiBold" style={styles.cardTitle}>
            {title}
          </UITypography>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: statusBgColor }]}>
          <UITypography variant="medium" style={styles.scoreText}>
            {score}/{maxScore}
          </UITypography>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.cardContent}>
        {items.map((item, index) => (
          <View key={index} style={styles.checkItem}>
            <CheckIcon size={12} color="#099453" />
            <UITypography variant="medium" style={styles.checkItemText}>
              {item.label}
            </UITypography>
            {/* Status badge on first row, arrow on last row */}
            {index === 0 && (
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <UITypography 
                  variant="medium" 
                  style={status === 'good' ? styles.statusText : styles.statusTextModerate}
                >
                  {statusText}
                </UITypography>
              </View>
            )}
            {index === items.length - 1 && (
              <Pressable style={styles.arrowButton}>
                <RightArrowIcon size={12} color="#099453" />
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function CreditProfileScreen() {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const { farmer } = useFarmer();

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: top + 10 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <UIIconButton onPress={() => navigation.goBack()}>
            <ChevronLeftIcon size={24} color="#101010" />
          </UIIconButton>
          <UITypography variant="semiBold" style={styles.headerTitle}>
            My Credit Profile
          </UITypography>
          <View style={{ width: 24 }} />
        </View>

        {/* Overall Credit Health Card */}
        <View style={styles.overallCard}>
          <View style={styles.overallCardTopRow}>
            {/* Left Column: Profile, Divider, and Label */}
            <View style={styles.leftColumn}>
              {/* Profile Section */}
              <View style={styles.profileSection}>
                <Image source={Avatar} style={styles.avatar} />
                <View style={styles.profileInfo}>
                  <UITypography variant="semiBold" style={styles.profileName}>
                    {farmer?.attributes?.name || 'Kwame Mensah'}
                  </UITypography>
                  <UITypography variant="medium" style={styles.profileId}>
                    35202-1234567-1
                  </UITypography>
                </View>
              </View>
              
              {/* Spacer to push divider to bottom */}
              <View style={{ flex: 1 }} />
              
              {/* Divider and Label at bottom */}
              <View>
                <View style={styles.overallDivider} />
                <UITypography variant="medium" style={styles.creditHealthLabel}>
                  Overall Credit Health
                </UITypography>
              </View>
            </View>

            {/* Right: Gauge Section */}
            <View style={styles.gaugeSection}>
              <CreditGauge />
              <View style={styles.lowRiskBadge}>
                <UITypography variant="medium" style={styles.lowRiskText}>
                  LOW RISK
                </UITypography>
              </View>
            </View>
          </View>
        </View>

        {/* Identity Verification Card */}
        <CreditCard
          title="Identity Verification"
          score="55"
          maxScore="60"
          status="good"
          icon={
            <View style={[styles.iconContainer, { backgroundColor: 'transparent' }]}>
              <VectorCheckmarkIcon size={24} color="#1D3A70" />
            </View>
          }
          items={[
            { label: 'NADRA ID Verified', checked: true },
            { label: 'Residence status: Owned', checked: true },
            { label: 'Cooperative Member', checked: true },
          ]}
        />

        {/* Farm Profile Card */}
        <CreditCard
          title="Farm Profile"
          score="65"
          maxScore="70"
          status="good"
          icon={
            <View style={styles.iconContainer}>
              <FarmIcon size={28} backgroundColor="#1D3A70" strokeColor="white" />
            </View>
          }
          items={[
            { label: 'Crops Diversification: True', checked: true },
            { label: 'Farm Status: Owned', checked: true },
            { label: 'Farm size: Small Holder', checked: true },
          ]}
        />

        {/* Income Profile Card */}
        <CreditCard
          title="Income Profile"
          score="33"
          maxScore="45"
          status="moderate"
          icon={
            <View style={[styles.iconContainer, { backgroundColor: '#1D3A70' }]}>
              <UITypography style={styles.iconText}>Rs</UITypography>
            </View>
          }
          items={[
            { label: 'Buyer Agreement Present', checked: true },
            { label: 'Market-Linked Farmer', checked: true },
            { label: 'Total Expected Output: Rs 5000', checked: true },
          ]}
        />

        {/* Credit History Card */}
        <CreditCard
          title="Credit History"
          score="29"
          maxScore="45"
          status="moderate"
          icon={
            <View style={styles.iconContainer}>
              <ClipboardIcon size={28} backgroundColor="#1D3A70" strokeColor="white" />
            </View>
          }
          items={[
            { label: 'Outstanding Debt: Rs 500', checked: true },
            { label: 'Facility Type: Term Loan', checked: true },
            { label: 'Existing Lender: HBL', checked: true },
          ]}
        />

        {/* Secure Credit Assessment */}
        <View style={styles.secureSection}>
          <LockIcon width={16} height={16} color="#444" />
          <UITypography variant="medium" style={styles.secureText}>
            Secure Credit Assessment
          </UITypography>
        </View>
      </ScrollView>
    </View>
  );
}
