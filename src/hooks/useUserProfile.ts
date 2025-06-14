
import { useState, useEffect } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetIndustry: string;
  interviewType: string;
  experienceLevel: string;
  currentRole: string;
  targetRole: string;
  skills: string[];
  createdAt: number;
  updatedAt: number;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = () => {
      try {
        const savedProfile = localStorage.getItem('candidai_user_profile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: Date.now()
    };

    setProfile(updatedProfile);
    localStorage.setItem('candidai_user_profile', JSON.stringify(updatedProfile));
  };

  const createProfile = (profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProfile: UserProfile = {
      ...profileData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setProfile(newProfile);
    localStorage.setItem('candidai_user_profile', JSON.stringify(newProfile));
    return newProfile;
  };

  return {
    profile,
    isLoading,
    updateProfile,
    createProfile
  };
};
