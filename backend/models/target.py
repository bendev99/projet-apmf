from db import targets
from datetime import datetime

class Target:
    @staticmethod
    def create(ip, alias=None, port=22, enabled=True):
        """Créer une nouvelle cible"""
        target = {
            "ip": ip,
            "alias": alias or ip,
            "port": port,
            "enabled": enabled,
            "created_at": datetime.utcnow().isoformat()
        }

        result = targets.insert_one(target)
        target["_id"] = str(result.inserted_id)
        return target

    @staticmethod
    def find_all():
        """Récupérer toutes les cibles"""
        return list(targets.find())

    @staticmethod
    def find_by_ip(ip):
        """Trouver une cible par IP"""
        return targets.find_one({"ip": ip})

    @staticmethod
    def update(ip, updates):
        """Mettre à jour une cible"""
        return targets.update_one({"ip": ip}, {"$set": updates})

    @staticmethod
    def delete(ip):
        """Supprimer une cible"""
        return targets.delete_one({"ip": ip})
