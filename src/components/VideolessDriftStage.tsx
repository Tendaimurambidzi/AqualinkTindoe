import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type StoryCard = {
  id: string;
  title: string;
  body?: string;
  tag?: string;
  author?: string;
};

type PollOption = {
  id: string;
  label: string;
};

type PollData = {
  question: string;
  options: PollOption[];
  votes: Record<string, number>;
};

type GoalData = {
  target: number;
  current: number;
  label?: string;
};

type ReactionEvent = {
  id: string;
  emoji: string;
  from?: string;
};

type MomentItem = {
  id: string;
  text: string;
  at: number;
};

type Props = {
  hostName: string;
  storyCard?: StoryCard | null;
  storyCardCount: number;
  poll?: PollData | null;
  goal?: GoalData | null;
  moments: MomentItem[];
  onVotePoll?: (optionId: string) => void;
};

export default function VideolessDriftStage({
  hostName,
  storyCard,
  storyCardCount,
  poll,
  goal,
  moments,
  onVotePoll,
}: Props) {
  const totalVotes = poll
    ? poll.options.reduce((sum, option) => sum + Number(poll.votes?.[option.id] || 0), 0)
    : 0;
  const goalRatio = goal?.target ? Math.max(0, Math.min(1, Number(goal.current || 0) / Number(goal.target || 1))) : 0;
  const topMoments = moments.slice(0, 3);

  return (
    <LinearGradient
      colors={['#08111d', '#10223b', '#071827']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.stage}
    >
      <View style={styles.glowOrbOne} />
      <View style={styles.glowOrbTwo} />

      <View style={styles.contentGrid}>
        <View style={styles.centerColumn}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Story Card</Text>
              <Text style={styles.cardMeta}>
                {storyCardCount} total
              </Text>
            </View>
            {storyCard ? (
              <>
                {!!storyCard.tag && <Text style={styles.storyTag}>{storyCard.tag}</Text>}
                <Text style={styles.storyHeadline} numberOfLines={2}>
                  {storyCard.title}
                </Text>
                {!!storyCard.body && (
                  <Text style={styles.storyBody} numberOfLines={4}>
                    {storyCard.body}
                  </Text>
                )}
                <Text style={styles.storyMeta}>
                  {storyCard.author || hostName || 'Host'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.storyHeadline}>No story cards yet</Text>
                <Text style={styles.storyBody}>
                  Use Controls to publish the first story card for this session.
                </Text>
              </>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Timeline</Text>
              <Text style={styles.cardMeta}>{moments.length} items</Text>
            </View>
            {topMoments.length > 0 ? (
              topMoments.map(item => (
                <View key={item.id} style={styles.momentRow}>
                  <View style={styles.momentDot} />
                  <Text style={styles.momentText} numberOfLines={2}>
                    {item.text}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.storyBody}>
                Key moments will appear here once the session starts moving.
              </Text>
            )}
          </View>

          {poll ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Live Poll</Text>
                <Text style={styles.cardMeta}>{totalVotes} votes</Text>
              </View>
              <Text style={styles.pollQuestion}>{poll.question}</Text>
              {poll.options.map(option => {
                const votes = Number(poll.votes?.[option.id] || 0);
                const ratio = totalVotes > 0 ? votes / totalVotes : 0;
                return (
                  <Pressable
                    key={option.id}
                    style={styles.pollOption}
                    onPress={() => onVotePoll?.(option.id)}
                  >
                    <View style={[styles.pollFill, { width: `${Math.max(8, ratio * 100)}%` }]} />
                    <View style={styles.pollTextRow}>
                      <Text style={styles.pollLabel}>{option.label}</Text>
                      <Text style={styles.pollVotes}>{votes}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          {goal ? (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Live Goal</Text>
                <Text style={styles.cardMeta}>
                  {goal.current}/{goal.target}
                </Text>
              </View>
              <Text style={styles.goalLabel}>{goal.label || 'Session target'}</Text>
              <View style={styles.goalTrack}>
                <View style={[styles.goalFill, { width: `${goalRatio * 100}%` }]} />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  stage: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 22,
    paddingHorizontal: 16,
  },
  glowOrbOne: {
    position: 'absolute',
    top: 70,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0,194,255,0.16)',
  },
  glowOrbTwo: {
    position: 'absolute',
    bottom: 120,
    left: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(61,255,174,0.1)',
  },
  contentGrid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 58,
    paddingBottom: 142,
  },
  centerColumn: {
    width: '100%',
    maxWidth: 430,
    gap: 12,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 18,
    padding: 12,
    backgroundColor: 'rgba(6,14,24,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  cardMeta: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 11,
    fontWeight: '600',
  },
  storyTag: {
    alignSelf: 'flex-start',
    color: '#04131f',
    backgroundColor: '#8af4ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 10,
  },
  storyHeadline: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  storyBody: {
    color: 'rgba(220,239,255,0.8)',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  storyMeta: {
    color: '#72d8ff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 12,
  },
  pollQuestion: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  pollOption: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  pollFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,194,255,0.2)',
  },
  pollTextRow: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pollLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  pollVotes: {
    color: '#8af4ff',
    fontWeight: '800',
    marginLeft: 8,
  },
  goalLabel: {
    color: 'rgba(220,239,255,0.8)',
    fontSize: 12,
    marginBottom: 10,
  },
  goalTrack: {
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  goalFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#00c2ff',
  },
  momentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  momentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8af4ff',
    marginTop: 5,
    marginRight: 8,
  },
  momentText: {
    flex: 1,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    lineHeight: 17,
  },
});
