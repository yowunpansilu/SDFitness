import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Clock, MapPin, Calendar, User, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const classTypeColors = {
  yoga: 'from-purple-500 to-pink-600',
  hiit: 'from-orange-500 to-red-600',
  spin: 'from-blue-500 to-cyan-600',
  strength: 'from-amber-500 to-orange-600',
  cardio: 'from-green-500 to-emerald-600',
  pilates: 'from-indigo-500 to-purple-600',
};

// Mock data - in real app, fetch based on ID
const mockClass = {
  id: '1',
  name: 'Morning Yoga Flow',
  type: 'yoga' as const,
  description: 'Start your day with an energizing yoga session designed to improve flexibility and strength. Suitable for all levels.',
  trainer: {
    id: '3',
    name: 'Emma Wilson',
    photoUrl: undefined,
    email: 'emma.wilson@sdfitness.com',
    specializations: ['Yoga', 'Pilates', 'Meditation'],
  },
  schedule: {
    days: ['Monday', 'Wednesday', 'Friday'],
    time: '06:00 AM',
    duration: 60,
  },
  capacity: 20,
  enrolled: 18,
  location: 'Studio A',
  price: 15,
  isRecurring: true,
  createdDate: '2024-01-15',
};

const mockEnrolledMembers = [
  { id: '1', name: 'Michael Brown', photoUrl: undefined, joinedDate: '2024-01-20' },
  { id: '2', name: 'Emily Davis', photoUrl: undefined, joinedDate: '2024-01-22' },
  { id: '3', name: 'James Wilson', photoUrl: undefined, joinedDate: '2024-01-25' },
  { id: '4', name: 'Sarah Parker', photoUrl: undefined, joinedDate: '2024-01-28' },
  { id: '5', name: 'David Kim', photoUrl: undefined, joinedDate: '2024-02-01' },
];

export function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const enrollmentPercentage = (mockClass.enrolled / mockClass.capacity) * 100;
  const spotsRemaining = mockClass.capacity - mockClass.enrolled;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/classes')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              {mockClass.name}
            </h1>
            <p className="text-gray-400 mt-2">Class Details & Enrollment</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/classes/edit/${id}`)}
            className="bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Class
          </Button>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Enrollment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {mockClass.enrolled}/{mockClass.capacity}
            </div>
            <p className="text-xs text-gray-500 mt-1">{enrollmentPercentage.toFixed(0)}% Full</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Spots Remaining</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{spotsRemaining}</div>
            <p className="text-xs text-gray-500 mt-1">Available spots</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{mockClass.schedule.duration}</div>
            <p className="text-xs text-gray-500 mt-1">Minutes</p>
          </CardContent>
        </Card>

        <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">${mockClass.price}</div>
            <p className="text-xs text-gray-500 mt-1">Per session</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Class Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Description</label>
                <p className="text-white mt-1">{mockClass.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Class Type</label>
                  <div className="mt-1">
                    <Badge
                      className={cn(
                        'text-white bg-gradient-to-r',
                        classTypeColors[mockClass.type]
                      )}
                    >
                      {mockClass.type}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <p className="text-white mt-1">{mockClass.location}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule
                </label>
                <p className="text-white mt-1">
                  {mockClass.schedule.days.join(', ')} at {mockClass.schedule.time}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400">Created Date</label>
                <p className="text-white mt-1">
                  {new Date(mockClass.createdDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enrolled Members */}
          <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Enrolled Members ({mockClass.enrolled})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockEnrolledMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 hover:bg-dark-800 transition-colors cursor-pointer"
                    onClick={() => navigate(`/members/${member.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={member.photoUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          Joined {new Date(member.joinedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainer Info */}
        <div className="space-y-6">
          <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Trainer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={mockClass.trainer.photoUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white text-2xl">
                    {mockClass.trainer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {mockClass.trainer.name}
                  </h3>
                  <p className="text-gray-400 text-sm">{mockClass.trainer.email}</p>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Specializations</label>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {mockClass.trainer.specializations.map((spec) => (
                      <Badge
                        key={spec}
                        className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/trainers/${mockClass.trainer.id}`)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-dark-900/50 border-dark-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-dark-700 text-gray-300 hover:bg-dark-800"
              >
                Send Notification
              </Button>
              <Button
                variant="outline"
                className="w-full border-dark-700 text-gray-300 hover:bg-dark-800"
              >
                Download Roster
              </Button>
              <Button
                variant="outline"
                className="w-full border-dark-700 text-gray-300 hover:bg-dark-800"
              >
                Cancel Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
