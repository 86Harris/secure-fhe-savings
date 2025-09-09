import VaultHeader from "@/components/VaultHeader";
import VaultInterface from "@/components/VaultInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <VaultHeader />
      <main>
        <VaultInterface />
      </main>
    </div>
  );
};

export default Index;
