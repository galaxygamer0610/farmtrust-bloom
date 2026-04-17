from credit_score import CreditModel

if __name__ == '__main__':
    print("Training Credit Score Model Pipeline...")
    model = CreditModel()
    model.train()
    print("Pipeline evaluation complete.")
