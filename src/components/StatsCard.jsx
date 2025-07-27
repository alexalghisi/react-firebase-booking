import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color }) => {
    const colorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        purple: 'text-purple-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600'
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm">{title}</p>
                    <p className={`text-3xl font-bold ${colorClasses[color]}`}>
                        {value}
                    </p>
                </div>
                <Icon className={`w-12 h-12 ${colorClasses[color]}`} />
            </div>
        </div>
    );
};

export default StatsCard;