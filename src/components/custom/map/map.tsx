/* eslint-disable import/no-extraneous-dependencies */

'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import "@stadiamaps/maplibre-search-box/dist/style.css";
import React, { useRef, useState, useEffect } from 'react';
import { setSelectedMarker } from '@/redux/slices/general';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { MapLibreSearchControl } from "@stadiamaps/maplibre-search-box";
import Map, { Popup, Marker, useControl, GeolocateControl, NavigationControl, FullscreenControl } from 'react-map-gl/maplibre';

import { debounce, Typography } from '@mui/material';

import './map.style.css';
import { DEFAULT_MAP_LAT, DEFAULT_MAP_LNG, DEFAULT_MAP_ZOOM } from './map.style';

function AutocompleteControl(props: any) {
    useControl(() => new MapLibreSearchControl(props), {
        position: "top-left"
    });

    return null;
}

export interface PeliasGeoJSONFeature {
    type: string;
    geometry: Geometry;
    properties: Properties;
    bbox?: (number)[] | null;
}
export interface Geometry {
    type: string;
    coordinates?: (number)[] | null;
}
export interface Properties {
    id: string;
    gid: string;
    layer: string;
    source: string;
    souce_id: string;
    name: string;
    confidence: number;
    country: string;
    country_gid: string;
    country_a: string;
    macroregion: string;
    macroregion_gid: string;
    region: string;
    region_gid: string;
    locality: string;
    locality_gid: string;
    label: string;
    positionMarkerDefault: {
        lat: number;
        lng: number;
    }
}

const MapComponent = ({
    markers,
    onViewStateChange,
    renderPopup,
    onResultSelectedChanged,
    positionMarker,
    initialViewState,
    onPositionMarkerChange,
    editablePositionMarker
}: {
    markers: any[],
    onViewStateChange: any,
    renderPopup?: (marker: any) => any
    onResultSelectedChanged?: (feature: PeliasGeoJSONFeature) => void
    positionMarker?: {
        lat: number;
        lng: number;
    } | null
    initialViewState?: {
        lat: number;
        lng: number;
    } | null
    onPositionMarkerChange?: (payload: {
        lat: number;
        lng: number;
    }) => void
    editablePositionMarker?: boolean
}) => {
    const geoControlRef = useRef<any>();
    const mapref = useRef<any>();
    const selectedMarker = useAppSelector((state) => state.general.selectedMarker);
    const [resultSelected, setResultSelected] = useState<PeliasGeoJSONFeature | null>(null);
    const debouncedOnChange = debounce(onViewStateChange, 500);
    const dispatch = useAppDispatch();


    const focusMap = (payload: {
        latitude: number;
        longitude: number;
        offset: [number, number];
    }) => {
        mapref?.current?.getMap().flyTo({
            center: [payload.longitude, payload.latitude],
            offset: payload.offset,
            zoom: 10,
        });
    }


    useEffect(() => {
        if (selectedMarker) {
            focusMap({
                latitude: selectedMarker.latitude,
                longitude: selectedMarker.longitude,
                offset: [0, 120],
            });
        }
    }
        , [selectedMarker, mapref])

    return (
        <Map
            onClick={(e) => {
                // get current clicked location
                if (!onPositionMarkerChange) {
                    return;
                }

                // if another marker is clicked dont change the position marker
                if (selectedMarker) {
                    return;
                }


                const { lat } = e.lngLat
                const { lng } = e.lngLat

                onPositionMarkerChange({
                    lat,
                    lng,
                });

            }}
            ref={mapref}
            initialViewState={{
                longitude: initialViewState?.lng || DEFAULT_MAP_LNG,
                latitude: initialViewState?.lat || DEFAULT_MAP_LAT,
                zoom: DEFAULT_MAP_ZOOM,
            }}
            onMove={(viewport) => {
                debouncedOnChange(viewport.viewState);
            }}
            style={{
                width: "100%",
                height: "100%",
                borderRadius: "8px",
            }}
            mapStyle="https://api.maptiler.com/maps/streets-v2-dark/style.json?key=hOQ3s9ElzSMNJ5fUgstr" // mapStyle importend from map.style.ts
        >
            <FullscreenControl />
            {selectedMarker ? (
                <Popup
                    key={JSON.stringify(selectedMarker)}
                    closeOnClick={false}
                    latitude={selectedMarker.latitude}
                    longitude={selectedMarker.longitude}
                    anchor="bottom"
                    onClose={(e) => {
                        dispatch(setSelectedMarker(null));
                    }}>
                    {renderPopup ? renderPopup(selectedMarker) : <Typography>No data</Typography>}
                </Popup>) : null}

            <AutocompleteControl
                useMapFocusPoint
                key="3b3d4351-3f5d-4084-9524-82367eb0ef82"
                mapFocusPointMinZoom={5}
                searchOnEnter={false}
                maxResults={5}
                minInputLength={3}
                minWaitPeriodMs={100}
                onResultSelected={(feature: PeliasGeoJSONFeature) => {
                    setResultSelected(feature);
                    if (onResultSelectedChanged) {
                        onResultSelectedChanged(feature);
                    }
                }}
            />
            <GeolocateControl ref={geoControlRef} />
            <NavigationControl />

            {markers.map((marker, index) => (
                <Marker
                    onClick={() => {
                        dispatch(setSelectedMarker(marker));
                    }}
                    key={index}
                    latitude={marker.latitude}
                    longitude={marker.longitude}
                    anchor="bottom" >
                    <img
                        alt='marker'
                        width="48"
                        height="48"
                        src="https://i.imgur.com/bo4rny8.png" />
                </Marker>
            ))}



            {resultSelected &&
                resultSelected.geometry.coordinates &&
                resultSelected.geometry.coordinates.length === 2
                ? <Marker
                    latitude={resultSelected?.geometry?.coordinates[1]}
                    longitude={resultSelected?.geometry?.coordinates[0]}
                    anchor="bottom" >
                    <img
                        alt='marker'
                        width="64"
                        height="64"
                        src="https://i.imgur.com/8Vngn6D.png" />
                </Marker> : null}



            {positionMarker
                ? <Marker
                    draggable={editablePositionMarker}
                    onDragEnd={(e) => {
                        if (!onPositionMarkerChange) {
                            return;
                        }

                        const { lat } = e.lngLat
                        const { lng } = e.lngLat

                        onPositionMarkerChange({
                            lat,
                            lng,
                        });
                    }}
                    latitude={positionMarker.lat}
                    longitude={positionMarker.lng}
                    anchor="bottom" >
                    <img
                        alt='marker'
                        width="64"
                        height="64"
                        src="https://i.imgur.com/RF11SW7.png" />
                </Marker> : null}
        </Map>
    )
}


const MapComponentMemo = React.memo(MapComponent);

export default MapComponentMemo;