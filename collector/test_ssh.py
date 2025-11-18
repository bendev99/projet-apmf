import paramiko

def test_ssh():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        ssh.connect(
            hostname='10.139.245.131',
            username='debian',
            key_filename='/home/ben/.ssh/apmf_key',
            port=22
        )

        # Test de commandes
        commands = ['uptime', 'free -m', 'df -h']
        for cmd in commands:
            stdin, stdout, stderr = ssh.exec_command(cmd)
            print(f"\n[{cmd}]:")
            print(stdout.read().decode())

        ssh.close()
        print("\nTout fonctionne parfaitement!")

    except Exception as e:
        print(f"Erreur: {e}")

test_ssh()
