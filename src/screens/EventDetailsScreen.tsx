import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {useThemeStore} from '@/store/themeStore';
import {apiClient} from '@/services/api';
import {EventShop} from '@/types/api';
import {TicketTree} from '@/components/TicketTree';
import {useBasketStore} from '@/store/basketStore';
import {RootStackParamList} from '@/navigation/AppNavigator';

type EventDetailsRouteProp = RouteProp<RootStackParamList, 'EventDetails'>;

export const EventDetailsScreen: React.FC = () => {
    const route = useRoute<EventDetailsRouteProp>();
    const {eventSqid, eventTitle} = route.params;
    const theme = useThemeStore((state) => state.theme);
    const basketItems = useBasketStore((state) => state.items);
    const [eventShop, setEventShop] = useState<EventShop | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventShop = async () => {
            setLoading(true);
            setError(null);
            try {
                const shop = await apiClient.getEventShop(eventSqid);
                setEventShop(shop);
            } catch (err) {
                setError(
                    err instanceof Error ? err.message : 'Failed to load event details'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchEventShop();
    }, [eventSqid]);

    const eventBasketItems = basketItems.filter(
        (item) => item.eventSqid === eventSqid
    );
    const basketTotal = eventBasketItems.reduce(
        (total, item) => total + (item.ticketTypeInfo.price || 0) * item.quantity,
        0
    );

    if (loading) {
        return (
            <View
                testID="event-details-loading"
                style={[
                    styles.container,
                    styles.centerContent,
                    {backgroundColor: theme.colors.background},
                ]}
            >
                <ActivityIndicator
                    testID="event-details-loading-indicator"
                    size="large"
                    color={theme.colors.primary}
                />
            </View>
        );
    }

    if (error || !eventShop) {
        return (
            <View
                testID="event-details-error"
                style={[
                    styles.container,
                    styles.centerContent,
                    {backgroundColor: theme.colors.background},
                ]}
            >
                <Text
                    testID="event-details-error-text"
                    style={[styles.errorText, {color: theme.colors.error}]}
                >
                    {error || 'Event not found'}
                </Text>
            </View>
        );
    }

    return (
        <View
            testID="event-details-screen"
            accessible={true}
            style={[styles.container, {backgroundColor: theme.colors.background}]}
        >
            <ScrollView
                testID="event-details-scroll"
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <View
                    testID="event-details-header"
                    style={[
                        styles.header,
                        {backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border},
                    ]}
                >
                    <Text
                        testID="event-details-title"
                        style={[styles.title, {color: theme.colors.text}]}
                    >
                        {eventTitle}
                    </Text>
                </View>

                {eventBasketItems.length > 0 && (
                    <View
                        testID="event-details-basket-summary"
                        style={[
                            styles.basketSummary,
                            {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
                        ]}
                    >
                        <Text
                            testID="event-details-basket-summary-title"
                            style={[styles.basketSummaryTitle, {color: theme.colors.text}]}
                        >
                            Basket Summary
                        </Text>
                        <Text
                            testID="event-details-basket-summary-count"
                            style={[styles.basketSummaryText, {color: theme.colors.textSecondary}]}
                        >
                            {eventBasketItems.reduce((sum, item) => sum + item.quantity, 0)} items
                        </Text>
                        <Text
                            testID="event-details-basket-summary-total"
                            style={[styles.basketSummaryTotal, {color: theme.colors.primary}]}
                        >
                            Total: €{basketTotal.toFixed(2)}
                        </Text>
                    </View>
                )}

                <TicketTree
                    testID="event-details-ticket-tree"
                    eventShop={eventShop}
                    eventSqid={eventSqid}
                    eventTitle={eventTitle}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 16,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
    },
    basketSummary: {
        margin: 16,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
    },
    basketSummaryTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    basketSummaryText: {
        fontSize: 14,
        marginBottom: 4,
    },
    basketSummaryTotal: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 4,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
});

